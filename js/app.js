// Khởi tạo ứng dụng Vue
const { createApp, ref, reactive, computed, onMounted } = Vue;

const app = createApp({
    setup() {
        // Khởi tạo PocketBase
        const pb = new PocketBase('http://103.163.118.103:401');
        
        // Trạng thái ứng dụng
        const currentPage = ref('home');
        const searchQuery = ref('');
        const searchResults = ref([]);
        const hasSearched = ref(false);
        const selectedRecord = ref({});
        const isLoading = ref(false);
        const errorMessage = ref('');
        
        // Danh sách hương linh đã tải về
        const allRecords = ref([]);
        
        // Cấu hình Fuse.js cho tìm kiếm gần đúng
        const fuseOptions = {
            keys: ['hoten_die', 'hoten_owner', 'sdt'],
            threshold: 0.4, // Ngưỡng tìm kiếm (0 = chính xác, 1 = khớp tất cả)
            includeScore: true
        };
        
        // Tải dữ liệu từ PocketBase
        const fetchData = async () => {
            try {
                isLoading.value = true;
                errorMessage.value = '';
                
                // Lấy toàn bộ danh sách hương linh
                const records = await pb.collection('ghostmg').getFullList({
                    sort: '-created',
                });
                
                allRecords.value = records;
                console.log('Đã tải dữ liệu:', records.length, 'bản ghi');
                
                // Khởi tạo Fuse.js với dữ liệu đã tải
                initFuse();
                
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu:', error);
                errorMessage.value = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
            } finally {
                isLoading.value = false;
            }
        };
        
        // Khởi tạo Fuse.js
        let fuse;
        const initFuse = () => {
            if (allRecords.value.length > 0) {
                fuse = new Fuse(allRecords.value, fuseOptions);
            }
        };
        
        // Thực hiện tìm kiếm
        const performSearch = () => {
            if (!searchQuery.value.trim()) {
                searchResults.value = [];
                hasSearched.value = false;
                return;
            }
            
            hasSearched.value = true;
            
            if (fuse && searchQuery.value) {
                const results = fuse.search(searchQuery.value);
                // Lấy kết quả và sắp xếp theo điểm số (score) thấp hơn = khớp hơn
                searchResults.value = results.map(result => result.item);
            }
        };
        
        // Hiển thị chi tiết hương linh
        const showDetail = (record) => {
            selectedRecord.value = record;
            currentPage.value = 'detail';
        };
        
        // Format ngày tháng
        const formatDate = (dateString) => {
            if (!dateString) return '';
            
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (error) {
                return dateString;
            }
        };
        
        // Tải dữ liệu khi ứng dụng khởi động
        onMounted(() => {
            fetchData();
        });
        
        return {
            currentPage,
            searchQuery,
            searchResults,
            hasSearched,
            selectedRecord,
            isLoading,
            errorMessage,
            performSearch,
            showDetail,
            formatDate
        };
    }
});

// Mount ứng dụng
app.mount('#app');
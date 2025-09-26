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
        
        // Cache dữ liệu
        const searchIndex = ref([]); // Chỉ chứa dữ liệu tìm kiếm
        const detailCache = ref(new Map()); // Cache chi tiết record
        const currentPage_data = ref(1);
        const perPage = ref(100); // Tăng lên vì dữ liệu nhỏ hơn
        const totalPages = ref(0);
        const isDataLoaded = ref(false);
        
        // Cấu hình Fuse.js
        const fuseOptions = {
            keys: ['hoten_die', 'hoten_owner', 'sdt'],
            threshold: 0.4,
            includeScore: true
        };
        
        // Phát hiện thiết bị mobile
        const isMobile1 = () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   window.innerWidth <= 768;
        };
        const isMobile = () => {
            return false ;
        };
        
        // Tải dữ liệu tối thiểu cho tìm kiếm
        const fetchSearchIndex = async (page = 1, retryCount = 0) => {
            try {
                isLoading.value = true;
                errorMessage.value = '';
                
                const timeoutMs = isMobile() ? 15000 : 30000;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                
                // Chỉ lấy trường cần thiết cho tìm kiếm và hiển thị danh sách
                const records = await pb.collection('ghostmg').getList(page, perPage.value, {
                    sort: '-created',
                    fields: 'hoten_die,hoten_owner,sdt', // Chỉ lấy trường cần thiết
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                // Cập nhật search index
                if (page === 1) {
                    searchIndex.value = records.items;
                } else {
                    searchIndex.value = [...searchIndex.value, ...records.items];
                }
                
                totalPages.value = records.totalPages;
                currentPage_data.value = page;
                isDataLoaded.value = true;
                
                console.log(`Đã tải search index trang ${page}: ${records.items.length} bản ghi`);
                console.log(`Tổng search index: ${searchIndex.value.length}/${records.totalItems} bản ghi`);
                
                // Khởi tạo Fuse.js
                initFuse();
                
            } catch (error) {
                console.error('Lỗi khi tải search index:', error);
                
                // Retry logic
                if (error.name === 'AbortError' && retryCount < 2) {
                    console.log(`Thử lại lần ${retryCount + 1}...`);
                    setTimeout(() => {
                        fetchSearchIndex(page, retryCount + 1);
                    }, 2000);
                    return;
                }
                
                if (error.name === 'AbortError') {
                    errorMessage.value = 'Kết nối quá chậm. Vui lòng kiểm tra mạng và thử lại.';
                } else {
                    errorMessage.value = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
                }
            } finally {
                isLoading.value = false;
            }
        };
        
        // Tải chi tiết record khi cần
        const fetchRecordDetail = async (recordId) => {
            // Kiểm tra cache trước
            if (detailCache.value.has(recordId)) {
                return detailCache.value.get(recordId);
            }
            
            try {
                // Lấy đầy đủ thông tin record
                const record = await pb.collection('ghostmg').getOne(recordId, {
                    fields: 'id,hoten_die,hoten_owner,sdt,bang,hang,cot,ngay_mat,ngay_nhap_linh,note,created,updated'
                });
                
                // Lưu vào cache
                detailCache.value.set(recordId, record);
                
                return record;
            } catch (error) {
                console.error('Lỗi khi tải chi tiết record:', error);
                return null;
            }
        };
        
        // Tải thêm dữ liệu search index
        const loadMoreSearchIndex = async () => {
            if (currentPage_data.value < totalPages.value && !isLoading.value) {
                await fetchSearchIndex(currentPage_data.value + 1);
            }
        };
        
        // Khởi tạo Fuse.js
        let fuse;
        const initFuse = () => {
            if (searchIndex.value.length > 0) {
                fuse = new Fuse(searchIndex.value, fuseOptions);
            }
        };
        
        // Tìm kiếm trong search index
        const performSearch = async () => {
            const query = searchQuery.value.trim();
            if (!query) {
                searchResults.value = [];
                hasSearched.value = false;
                return;
            }
            
            hasSearched.value = true;
            
            try {
                // Nếu chưa có dữ liệu, tải search index đầu tiên
                if (!isDataLoaded.value) {
                    await fetchSearchIndex(1);
                }

                

                
                // Tìm kiếm trong search index
                if (fuse && query) {
                    const results = fuse.search(query);
                    searchResults.value = results.map(result => result.item);
                    
                    // Nếu kết quả ít và chưa tải hết search index, thử tải thêm
                    if (searchResults.value.length < 5 && currentPage_data.value < totalPages.value) {
                        console.log('Tìm kiếm ít kết quả, đang tải thêm search index...');
                        await loadMoreSearchIndex();
                        
                        // Tìm kiếm lại
                        const newResults = fuse.search(query);
                        searchResults.value = newResults.map(result => result.item);
                    }
                }
                
            } catch (error) {
                console.error('Lỗi khi tìm kiếm:', error);
                errorMessage.value = 'Lỗi tìm kiếm. Vui lòng thử lại.';
            }
        };
        
        // Hiển thị chi tiết hương linh
        const showDetail = async (record) => {
            currentPage.value = 'detail';
            selectedRecord.value = record; // Hiển thị dữ liệu cơ bản trước
            
            // Tải chi tiết đầy đủ trong background
            const fullRecord = await fetchRecordDetail(record.id);
            if (fullRecord) {
                selectedRecord.value = fullRecord;
            }
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
        
        // Debounce search
        let searchTimeout;
        const debouncedSearch = () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 300); // Giảm xuống 300ms vì dữ liệu nhỏ hơn
        };
        
        // Preload toàn bộ search index cho desktop
        const preloadAllSearchIndex = async () => {
            if (!isMobile() && isDataLoaded.value) {
                while (currentPage_data.value < totalPages.value) {
                    await new Promise(resolve => setTimeout(resolve, 300)); // Đợi 1s giữa các request
                    await loadMoreSearchIndex();
                }
                console.log('Đã preload toàn bộ search index');
            }
        };
        
        // Khởi tạo
        onMounted(async () => {
            // Tải search index đầu tiên
            await fetchSearchIndex(1);
            
            // Preload thêm cho desktop
            setTimeout(preloadAllSearchIndex, 3000);
        });
        
        return {
            currentPage,
            searchQuery,
            searchResults,
            hasSearched,
            selectedRecord,
            isLoading,
            errorMessage,
            performSearch: debouncedSearch,
            showDetail,
            formatDate,
            loadMoreSearchIndex,
            currentPage_data,
            totalPages,
            isDataLoaded,
            searchIndex,
            fetchSearchIndex
        };
    }
});

// Mount ứng dụng
app.mount('#app');
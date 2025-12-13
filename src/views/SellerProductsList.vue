<template>
  <main class="seller-products-page">
    <div class="container">
      <div class="page-header">
        <h1>내 상품 목록</h1>
        <p>등록한 모든 상품을 확인하고 관리할 수 있습니다.</p>
      </div>

      <div v-if="allProducts.length === 0" class="empty-state">
        <p>등록된 상품이 없습니다.</p>
        <router-link to="/seller/register/product-register" class="btn btn-primary">
          상품 등록하기
        </router-link>
      </div>

      <div v-else class="products-grid">
        <div v-for="product in allProducts" :key="product.id" class="product-card">
          <div class="product-image-wrapper">
            <img :src="product.image || product.images?.[0]" :alt="product.title" />
            <div class="product-badges">
              <span v-if="product.currentCount >= product.targetCount" class="badge badge-success">목표 달성</span>
              <span v-if="product.currentCount < product.targetCount * 0.3" class="badge badge-new">신규</span>
            </div>
          </div>
          <div class="product-info">
            <p class="product-category">{{ product.category }}</p>
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-subtitle">{{ product.subtitle }}</p>
            <div class="product-price-info">
              <span class="current-price">₩{{ product.currentPrice?.toLocaleString() || product.price?.toLocaleString() }}</span>
              <span v-if="product.originalPrice" class="original-price">₩{{ product.originalPrice.toLocaleString() }}</span>
            </div>
            <div class="product-progress">
              <div class="progress-info">
                <span class="progress-text">
                  {{ product.currentCount || 0 }} / {{ product.targetCount }}명 참여
                </span>
                <span class="progress-percent">
                  {{ Math.round(((product.currentCount || 0) / product.targetCount) * 100) }}%
                </span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${Math.min(((product.currentCount || 0) / product.targetCount) * 100, 100)}%` }"
                ></div>
              </div>
            </div>
            <div class="product-meta">
              <span class="rating">⭐ {{ product.rating || 0 }}</span>
              <span class="reviews">리뷰 {{ product.reviewCount || 0 }}</span>
            </div>
            <div class="product-actions">
              <button class="btn btn-outline" @click="viewProduct(product.id)">상세보기</button>
              <button class="btn btn-outline" @click="editProduct(product.id)">수정</button>
              <button class="btn btn-outline btn-danger" @click="deleteProduct(product.id)">삭제</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productApi } from '@/api/axios'
import { getSellerProducts } from '@/data/products'

const router = useRouter()

const allProducts = ref([])
const loading = ref(false)

const loadProducts = async () => {
  loading.value = true
  try {
    // TODO: 실제 API로 상품 목록 조회
    // const response = await productApi.getProducts()
    // allProducts.value = response.data.data || []
    
    // 임시: localStorage에서 등록한 상품 가져오기
    const registeredProducts = JSON.parse(localStorage.getItem('seller_products') || '[]')
    
    // 기본 샘플 상품 중 판매자 이름이 일치하는 것 가져오기
    const sellerName = JSON.parse(localStorage.getItem('seller_profile') || '{}').name || '테크샵'
    const sampleProducts = getSellerProducts(sellerName)
    
    // 두 목록 합치기
    allProducts.value = [...registeredProducts, ...sampleProducts]
  } catch (error) {
    console.error('Failed to load products:', error)
    alert('상품 목록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const viewProduct = (id) => {
  router.push({ name: 'product-detail', params: { id } })
}

const editProduct = (id) => {
  router.push({ name: 'product-update', params: { productId: id } })
}

const deleteProduct = async (id) => {
  if (!confirm('정말 이 상품을 삭제하시겠습니까?')) {
    return
  }
  
  try {
    // UUID 형식인지 확인 (백엔드에서 UUID를 사용하므로)
    // id가 숫자면 UUID로 변환 필요할 수 있음
    const productId = typeof id === 'string' && id.includes('-') ? id : id.toString()
    
    await productApi.deleteProduct(productId)
    
    alert('상품이 삭제되었습니다.')
    loadProducts()
  } catch (error) {
    const errorMessage = error.response?.data?.message || '상품 삭제에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
    console.error('Product deletion error:', error)
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.seller-products-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding: 32px 0 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.page-header p {
  color: #a0a0a0;
  font-size: 15px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #a0a0a0;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 18px;
}

.empty-state .btn-primary {
  background: #ffffff;
  color: #0a0a0a;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
}

.empty-state .btn-primary:hover {
  background: #f0f0f0;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.product-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #4a4a4a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
  background: #0f0f0f;
  overflow: hidden;
}

.product-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #2b8a3e;
  color: white;
}

.badge-new {
  background: #4c6ef5;
  color: white;
}

.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-category {
  font-size: 13px;
  color: #ffffff;
  font-weight: 600;
  margin: 0;
}

.product-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.4;
}

.product-subtitle {
  font-size: 14px;
  color: #a0a0a0;
  margin: 0;
  line-height: 1.4;
}

.product-price-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-price {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.original-price {
  font-size: 14px;
  color: #666;
  text-decoration: line-through;
}

.product-progress {
  margin-top: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.progress-text {
  font-size: 13px;
  color: #e0e0e0;
}

.progress-percent {
  font-size: 13px;
  color: #ffffff;
  font-weight: 600;
}

.progress-bar {
  height: 6px;
  background: #0f0f0f;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffffff;
  border-radius: inherit;
  transition: width 0.3s;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #a0a0a0;
}

.rating {
  color: #ffffff;
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #4a4a4a;
  background: transparent;
  color: #ffffff;
}

.btn-outline:hover {
  background: #2a2a2a;
  border-color: #666;
}

.btn-danger {
  border-color: #ff4757;
  color: #ff4757;
}

.btn-danger:hover {
  background: #ff4757;
  color: white;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>







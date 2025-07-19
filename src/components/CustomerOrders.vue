<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">
        <i class="bi bi-cart-fill"></i> 
        Órdenes de Compra
        <span v-if="customer" class="text-muted">- {{ customer.name }}</span>
      </h5>
      <button 
        type="button" 
        class="btn btn-outline-primary btn-sm" 
        @click="cargarOrdenes"
        :disabled="cargando || !customer"
      >
        <span v-if="cargando" class="spinner-border spinner-border-sm me-1" role="status">
          <span class="visually-hidden">Cargando...</span>
        </span>
        <i v-else class="bi bi-arrow-clockwise"></i>
        Actualizar
      </button>
    </div>

    <div class="card-body">
      <!-- Alertas -->
      <div v-if="mensaje" class="alert alert-success alert-dismissible fade show" role="alert">
        {{ mensaje }}
        <button type="button" class="btn-close" @click="mensaje = ''" aria-label="Close"></button>
      </div>

      <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ error }}
        <button type="button" class="btn-close" @click="error = ''" aria-label="Close"></button>
      </div>

      <!-- Sin customer seleccionado -->
      <div v-if="!customer" class="text-center py-4">
        <i class="bi bi-person-x display-1 text-muted"></i>
        <p class="text-muted mt-2">Seleccione un cliente para ver sus órdenes de compra</p>
      </div>

      <!-- Estado de carga -->
      <div v-else-if="cargando && ordenes.length === 0" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Cargando órdenes...</p>
      </div>

      <!-- Sin órdenes -->
      <div v-else-if="!cargando && ordenes.length === 0" class="text-center py-4">
        <i class="bi bi-cart-x display-1 text-muted"></i>
        <p class="text-muted mt-2">Este cliente no tiene órdenes de compra</p>
      </div>

      <!-- Lista de órdenes -->
      <div v-else class="row">
        <div 
          v-for="orden in ordenes" 
          :key="orden.id" 
          class="col-lg-6 col-xl-4 mb-3"
        >
          <div class="card h-100 order-card" :class="{ 'border-warning': orden.status === 'PENDING' }">
            <div class="card-header d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="bi bi-hash"></i> Orden {{ orden.id }}
              </small>
              <span 
                class="badge" 
                :class="`bg-${getStatusColor(orden.status)}`"
              >
                {{ getStatusText(orden.status) }}
              </span>
            </div>
            
            <div class="card-body">
              <!-- Información básica -->
              <div class="row mb-3">
                <div class="col-6">
                  <small class="text-muted">Fecha de pedido:</small>
                  <div class="fw-bold">{{ formatDate(orden.placedOn) }}</div>
                </div>
                <div class="col-6" v-if="orden.deliveredOn">
                  <small class="text-muted">Fecha de entrega:</small>
                  <div class="fw-bold">{{ formatDate(orden.deliveredOn) }}</div>
                </div>
              </div>

              <!-- Total -->
              <div class="mb-3">
                <small class="text-muted">Total:</small>
                <div class="h5 text-primary mb-0">
                  {{ formatPrice(calculateTotal(orden.lineItems)) }}
                </div>
              </div>

              <!-- Items resumen -->
              <div class="mb-3">
                <small class="text-muted">
                  <i class="bi bi-list"></i> 
                  {{ orden.lineItems?.length || 0 }} libro(s)
                </small>
                <div class="mt-1">
                  <div 
                    v-for="item in (orden.lineItems || []).slice(0, 2)" 
                    :key="item.id"
                    class="d-flex justify-content-between align-items-center py-1"
                  >
                    <span class="text-truncate me-2" style="max-width: 150px;">
                      {{ item.title || item.isbn }}
                    </span>
                    <span class="badge bg-secondary">{{ item.quantity }}</span>
                  </div>
                  <small 
                    v-if="(orden.lineItems?.length || 0) > 2" 
                    class="text-muted"
                  >
                    ... y {{ (orden.lineItems?.length || 0) - 2 }} más
                  </small>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button 
                type="button" 
                class="btn btn-outline-primary btn-sm w-100" 
                @click="verDetalles(orden.id)"
                :disabled="cargandoDetalle === orden.id"
              >
                <span v-if="cargandoDetalle === orden.id" class="spinner-border spinner-border-sm me-1" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </span>
                <i v-else class="bi bi-eye"></i>
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div 
      class="modal fade" 
      id="modalDetalles" 
      tabindex="-1" 
      aria-labelledby="modalDetallesLabel" 
      aria-hidden="true"
      ref="modalDetalles"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalDetallesLabel">
              <i class="bi bi-receipt"></i>
              Detalles de la Orden {{ ordenDetalle?.id }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="ordenDetalle">
            <!-- Información del cliente -->
            <div class="row mb-4">
              <div class="col-md-6">
                <h6><i class="bi bi-person"></i> Cliente</h6>
                <p class="mb-1"><strong>{{ ordenDetalle.customer?.name }}</strong></p>
                <p class="text-muted mb-0">{{ ordenDetalle.customer?.email }}</p>
              </div>
              <div class="col-md-6">
                <h6><i class="bi bi-calendar"></i> Fechas</h6>
                <p class="mb-1">
                  <strong>Pedido:</strong> {{ formatDate(ordenDetalle.placedOn) }}
                </p>
                <p class="mb-0" v-if="ordenDetalle.deliveredOn">
                  <strong>Entregado:</strong> {{ formatDate(ordenDetalle.deliveredOn) }}
                </p>
              </div>
            </div>

            <!-- Items de la orden -->
            <h6><i class="bi bi-list-ul"></i> Items de la Orden</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead class="table-light">
                  <tr>
                    <th>Libro</th>
                    <th>Autores</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in ordenDetalle.lineItems" :key="item.id">
                    <td>
                      <div>
                        <strong>{{ item.title || 'Sin título' }}</strong>
                      </div>
                      <small class="text-muted">ISBN: {{ item.isbn }}</small>
                    </td>
                    <td>
                      <small>
                        {{ (item.authors || []).join(', ') || 'Sin autores' }}
                      </small>
                    </td>
                    <td>
                      <span class="badge bg-secondary">{{ item.quantity }}</span>
                    </td>
                    <td>{{ formatPrice(item.price) }}</td>
                    <td class="fw-bold">
                      {{ formatPrice((item.price || 0) * (item.quantity || 0)) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="table-light">
                  <tr>
                    <th colspan="4" class="text-end">Total:</th>
                    <th class="text-primary">
                      {{ formatPrice(calculateTotal(ordenDetalle.lineItems)) }}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PurchaseOrderService from '../services/PurchaseOrderService'

export default {
  name: 'CustomerOrders',
  props: {
    customer: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      ordenes: [],
      ordenDetalle: null,
      cargando: false,
      cargandoDetalle: null,
      mensaje: '',
      error: ''
    }
  },
  watch: {
    customer: {
      handler(newCustomer) {
        if (newCustomer) {
          this.cargarOrdenes()
        } else {
          this.ordenes = []
          this.limpiarMensajes()
        }
      },
      immediate: true
    }
  },
  methods: {
    async cargarOrdenes() {
      if (!this.customer?.id) return

      this.cargando = true
      this.limpiarMensajes()

      try {
        this.ordenes = await PurchaseOrderService.getOrdersByCustomer(this.customer.id)
        console.log('Órdenes cargadas:', this.ordenes.length)
      } catch (error) {
        this.error = error.message
        console.error('Error al cargar órdenes:', error)
      } finally {
        this.cargando = false
      }
    },

    async verDetalles(ordenId) {
      this.cargandoDetalle = ordenId

      try {
        this.ordenDetalle = await PurchaseOrderService.getOrderDetails(ordenId)
        
        // Mostrar modal
        const modalElement = this.$refs.modalDetalles
        if (window.bootstrap) {
          const modal = new window.bootstrap.Modal(modalElement)
          modal.show()
        }
      } catch (error) {
        this.error = error.message
        console.error('Error al cargar detalles de la orden:', error)
      } finally {
        this.cargandoDetalle = null
      }
    },

    formatDate(dateString) {
      return PurchaseOrderService.formatDate(dateString)
    },

    formatPrice(price) {
      return PurchaseOrderService.formatPrice(price)
    },

    getStatusColor(status) {
      return PurchaseOrderService.getStatusColor(status)
    },

    getStatusText(status) {
      return PurchaseOrderService.getStatusText(status)
    },

    calculateTotal(lineItems) {
      return PurchaseOrderService.calculateOrderTotal(lineItems)
    },

    limpiarMensajes() {
      this.mensaje = ''
      this.error = ''
    }
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.order-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.alert {
  border-radius: 0.375rem;
}

.modal-content {
  border-radius: 0.5rem;
}

.table th {
  border-top: none;
  font-weight: 600;
  font-size: 0.875rem;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  font-size: 0.75em;
}

.border-warning {
  border-color: #ffc107 !important;
}
</style>

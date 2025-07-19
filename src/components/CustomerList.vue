<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">
        <i class="bi bi-people-fill"></i> Lista de Clientes
      </h5>
      <button 
        type="button" 
        class="btn btn-outline-primary btn-sm" 
        @click="cargarCustomers"
        :disabled="cargando"
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

      <!-- Búsqueda -->
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Buscar por nombre o email..."
              v-model="filtro"
            >
          </div>
        </div>
        <div class="col-md-6 text-end">
          <small class="text-muted">
            Mostrando {{ customersFiltrados.length }} de {{ customers.length }} clientes
          </small>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="cargando && customers.length === 0" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Cargando clientes...</p>
      </div>

      <!-- Lista vacía -->
      <div v-else-if="!cargando && customers.length === 0" class="text-center py-4">
        <i class="bi bi-people display-1 text-muted"></i>
        <p class="text-muted mt-2">No hay clientes registrados</p>
      </div>

      <!-- Tabla de customers -->
      <div v-else-if="customersFiltrados.length > 0" class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">
                <i class="bi bi-person"></i> Nombre
              </th>
              <th scope="col">
                <i class="bi bi-envelope"></i> Email
              </th>
              <th scope="col">Versión</th>
              <th scope="col" class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="customer in customersFiltrados" 
              :key="customer.id"
              :class="{ 'table-warning': customer.id === customerSeleccionado?.id }"
            >
              <td>
                <span class="badge bg-secondary">{{ customer.id }}</span>
              </td>
              <td>
                <strong>{{ customer.name }}</strong>
              </td>
              <td>
                <i class="bi bi-envelope text-muted me-1"></i>
                {{ customer.email }}
              </td>
              <td>
                <span class="badge bg-info">v{{ customer.version }}</span>
              </td>
              <td class="text-center">
                <div class="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    @click="seleccionarCustomer(customer)"
                    :disabled="eliminando === customer.id"
                    title="Editar"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    @click="confirmarEliminacion(customer)"
                    :disabled="eliminando === customer.id"
                    title="Eliminar"
                  >
                    <span v-if="eliminando === customer.id" class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Eliminando...</span>
                    </span>
                    <i v-else class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sin resultados de búsqueda -->
      <div v-else-if="filtro && customersFiltrados.length === 0" class="text-center py-4">
        <i class="bi bi-search display-1 text-muted"></i>
        <p class="text-muted mt-2">No se encontraron clientes que coincidan con "{{ filtro }}"</p>
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="filtro = ''">
          Limpiar búsqueda
        </button>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div 
      class="modal fade" 
      id="modalConfirmacion" 
      tabindex="-1" 
      aria-labelledby="modalConfirmacionLabel" 
      aria-hidden="true"
      ref="modalConfirmacion"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalConfirmacionLabel">
              <i class="bi bi-exclamation-triangle text-warning"></i>
              Confirmar Eliminación
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>¿Está seguro que desea eliminar el cliente <strong>{{ customerAEliminar?.name }}</strong>?</p>
            <div class="alert alert-warning" role="alert">
              <i class="bi bi-exclamation-triangle"></i>
              Esta acción no se puede deshacer.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="eliminarCustomer"
              :disabled="eliminando"
            >
              <span v-if="eliminando" class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Eliminando...</span>
              </span>
              <i v-else class="bi bi-trash"></i>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomerService from '../services/CustomerService'

export default {
  name: 'CustomerList',
  data() {
    return {
      customers: [],
      filtro: '',
      cargando: false,
      eliminando: null,
      mensaje: '',
      error: '',
      customerSeleccionado: null,
      customerAEliminar: null
    }
  },
  computed: {
    customersFiltrados() {
      if (!this.filtro) {
        return this.customers
      }
      
      const filtroLower = this.filtro.toLowerCase()
      return this.customers.filter(customer => 
        customer.name.toLowerCase().includes(filtroLower) ||
        customer.email.toLowerCase().includes(filtroLower)
      )
    }
  },
  async mounted() {
    await this.cargarCustomers()
  },
  methods: {
    async cargarCustomers() {
      this.cargando = true
      this.limpiarMensajes()
      
      try {
        this.customers = await CustomerService.getAllCustomers()
        console.log('Customers cargados:', this.customers.length)
      } catch (error) {
        this.error = error.message
        console.error('Error al cargar customers:', error)
      } finally {
        this.cargando = false
      }
    },

    seleccionarCustomer(customer) {
      this.customerSeleccionado = customer
      this.$emit('select', customer)
    },

    confirmarEliminacion(customer) {
      this.customerAEliminar = customer
      
      // Usar Bootstrap modal - asegurarnos de que Bootstrap esté disponible
      const modalElement = this.$refs.modalConfirmacion
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(modalElement)
        modal.show()
      } else {
        // Fallback si Bootstrap no está disponible
        if (confirm(`¿Está seguro que desea eliminar el cliente "${customer.name}"?`)) {
          this.eliminarCustomer()
        }
      }
    },

    async eliminarCustomer() {
      if (!this.customerAEliminar) return

      this.eliminando = this.customerAEliminar.id
      
      try {
        await CustomerService.deleteCustomer(this.customerAEliminar.id)
        
        // Remover de la lista local
        this.customers = this.customers.filter(c => c.id !== this.customerAEliminar.id)
        
        this.mensaje = `Cliente "${this.customerAEliminar.name}" eliminado exitosamente`
        
        // Si era el customer seleccionado, deseleccionar
        if (this.customerSeleccionado?.id === this.customerAEliminar.id) {
          this.customerSeleccionado = null
          this.$emit('select', null)
        }
        
        // Cerrar modal
        const modalElement = this.$refs.modalConfirmacion
        if (window.bootstrap) {
          const modal = window.bootstrap.Modal.getInstance(modalElement)
          if (modal) {
            modal.hide()
          }
        }
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.mensaje = ''
        }, 3000)
        
      } catch (error) {
        this.error = error.message
        console.error('Error al eliminar customer:', error)
      } finally {
        this.eliminando = null
        this.customerAEliminar = null
      }
    },

    // Método para actualizar la lista después de guardar
    async actualizarDespuesDeGuardar(customerGuardado) {
      // Si es un customer nuevo, agregarlo a la lista
      if (!this.customers.find(c => c.id === customerGuardado.id)) {
        this.customers.push(customerGuardado)
      } else {
        // Si es una actualización, reemplazar en la lista
        const index = this.customers.findIndex(c => c.id === customerGuardado.id)
        if (index !== -1) {
          this.customers.splice(index, 1, customerGuardado)
        }
      }
      
      // Recargar para asegurar consistencia
      await this.cargarCustomers()
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

.table-responsive {
  border-radius: 0.375rem;
}

.table th {
  border-top: none;
  font-weight: 600;
  font-size: 0.875rem;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.775rem;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.badge {
  font-size: 0.75em;
}

.alert {
  border-radius: 0.375rem;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.table-warning {
  --bs-table-accent-bg: rgba(255, 193, 7, 0.1);
}

.modal-content {
  border-radius: 0.5rem;
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
}
</style>

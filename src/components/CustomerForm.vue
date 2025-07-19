<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">
        <i class="bi bi-person-plus"></i>
        {{ customer.id ? 'Editar Cliente' : 'Nuevo Cliente' }}
      </h5>
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

      <div v-if="erroresValidacion.length > 0" class="alert alert-warning" role="alert">
        <strong>Errores de validación:</strong>
        <ul class="mb-0 mt-2">
          <li v-for="error in erroresValidacion" :key="error">{{ error }}</li>
        </ul>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="guardar">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="name" class="form-label">
                <i class="bi bi-person"></i> Nombre *
              </label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="formulario.name"
                :class="{ 'is-invalid': erroresValidacion.includes('El nombre es requerido') }"
                placeholder="Ingrese el nombre completo"
                maxlength="100"
              >
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">
                <i class="bi bi-envelope"></i> Email *
              </label>
              <input
                type="email"
                class="form-control"
                id="email"
                v-model="formulario.email"
                :class="{ 'is-invalid': erroresValidacion.some(e => e.includes('email')) }"
                placeholder="ejemplo@correo.com"
                maxlength="100"
              >
            </div>
          </div>
        </div>

        <!-- Información del estado -->
        <div v-if="customer.id" class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">ID</label>
              <input type="text" class="form-control" :value="customer.id" readonly>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Versión</label>
              <input type="text" class="form-control" :value="customer.version" readonly>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
          <button 
            type="button" 
            class="btn btn-secondary me-md-2" 
            @click="cancelar"
            :disabled="cargando"
          >
            <i class="bi bi-x-circle"></i> Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="cargando"
          >
            <span v-if="cargando" class="spinner-border spinner-border-sm me-2" role="status">
              <span class="visually-hidden">Cargando...</span>
            </span>
            <i v-else class="bi bi-check-circle"></i>
            {{ customer.id ? 'Actualizar' : 'Crear' }} Cliente
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import CustomerService from '../services/CustomerService'

export default {
  name: 'CustomerForm',
  props: {
    customer: {
      type: Object,
      default: () => ({
        id: null,
        name: '',
        email: '',
        phone: '',
        address: '',
        version: null
      })
    }
  },
  data() {
    return {
      formulario: {
        name: '',
        email: ''
      },
      cargando: false,
      mensaje: '',
      error: '',
      erroresValidacion: []
    }
  },
  watch: {
    customer: {
      handler(newCustomer) {
        this.inicializarFormulario(newCustomer)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    inicializarFormulario(customer) {
      this.formulario = {
        name: customer.name || '',
        email: customer.email || ''
      }
      this.limpiarMensajes()
    },

    async guardar() {
      this.limpiarMensajes()
      
      // Validar datos
      this.erroresValidacion = CustomerService.validateCustomer(this.formulario)
      if (this.erroresValidacion.length > 0) {
        return
      }

      this.cargando = true

      try {
        let customerGuardado
        
        if (this.customer.id) {
          // Actualizar customer existente
          customerGuardado = await CustomerService.updateCustomer(this.customer.id, {
            ...this.formulario,
            version: this.customer.version
          })
          this.mensaje = 'Cliente actualizado exitosamente'
        } else {
          // Crear nuevo customer
          customerGuardado = await CustomerService.createCustomer(this.formulario)
          this.mensaje = 'Cliente creado exitosamente'
          this.limpiarFormulario()
        }

        // Emitir evento al componente padre
        this.$emit('save', customerGuardado)

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.mensaje = ''
        }, 3000)

      } catch (error) {
        this.error = error.message
        console.error('Error al guardar customer:', error)
      } finally {
        this.cargando = false
      }
    },

    cancelar() {
      this.limpiarFormulario()
      this.limpiarMensajes()
      this.$emit('cancel')
    },

    limpiarFormulario() {
      this.formulario = {
        name: '',
        email: ''
      }
    },

    limpiarMensajes() {
      this.mensaje = ''
      this.error = ''
      this.erroresValidacion = []
    }
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.form-label {
  font-weight: 500;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn {
  border-radius: 0.375rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.alert {
  border-radius: 0.375rem;
}

.is-invalid {
  border-color: #dc3545;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}
</style>

<template>
  <div class="card">
    <div class="card-header">
      <h5 class="mb-0">{{ isEditing ? 'Editar Libro' : 'Nuevo Libro' }}</h5>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="isbn" class="form-label">ISBN <span class="text-danger">*</span></label>
          <input
            type="text"
            class="form-control"
            id="isbn"
            v-model="form.isbn"
            required
            maxlength="128"
            placeholder="Ingrese el ISBN del libro"
            :disabled="isEditing"
          />
          <div class="form-text" v-if="isEditing">El ISBN no se puede modificar al editar</div>
        </div>
        <div class="mb-3">
          <label for="title" class="form-label">Título <span class="text-danger">*</span></label>
          <input
            type="text"
            class="form-control"
            id="title"
            v-model="form.title"
            required
            maxlength="255"
            placeholder="Ingrese el título del libro"
          />
        </div>
        <div class="mb-3">
          <label for="price" class="form-label">Precio <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input
              type="number"
              class="form-control"
              id="price"
              v-model.number="form.price"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="inventorySold" class="form-label">Inventario Vendido</label>
              <input
                type="number"
                class="form-control"
                id="inventorySold"
                v-model.number="form.inventorySold"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label for="inventorySupplied" class="form-label">Inventario Suministrado</label>
              <input
                type="number"
                class="form-control"
                id="inventorySupplied"
                v-model.number="form.inventorySupplied"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div class="d-grid gap-2">
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-check-circle"></i>
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </button>
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="handleCancel"
            v-if="isEditing"
          >
            <i class="bi bi-x-circle"></i>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookForm',
  props: {
    book: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        isbn: '',
        title: '',
        price: 0,
        inventorySold: 0,
        inventorySupplied: 0
      }
    }
  },
  computed: {
    isEditing() {
      return this.book !== null
    }
  },
  watch: {
    book: {
      handler(newBook) {
        if (newBook) {
          this.form = { ...newBook }
        } else {
          this.resetForm()
        }
      },
      immediate: true
    }
  },
  methods: {
    handleSubmit() {
      if (!this.form.isbn.trim()) {
        alert('El ISBN del libro es requerido')
        return
      }
      if (!this.form.title.trim()) {
        alert('El título del libro es requerido')
        return
      }
      if (this.form.price <= 0) {
        alert('El precio debe ser mayor a 0')
        return
      }
      this.$emit('save', { ...this.form })
      if (!this.isEditing) {
        this.resetForm()
      }
    },
    handleCancel() {
      this.$emit('cancel')
      this.resetForm()
    },
    resetForm() {
      this.form = {
        isbn: '',
        title: '',
        price: 0,
        inventorySold: 0,
        inventorySupplied: 0
      }
    }
  }
}
</script>

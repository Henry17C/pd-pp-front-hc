<template>
  <div class="card">
    <div class="card-header">
      <h5 class="mb-0">{{ isEditing ? 'Editar Autor' : 'Nuevo Autor' }}</h5>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="name" class="form-label">Nombre <span class="text-danger">*</span></label>
          <input
            type="text"
            class="form-control"
            id="name"
            v-model="form.name"
            required
            maxlength="64"
            placeholder="Ingrese el nombre del autor"
          />
        </div>
        <div class="mb-3">
          <label for="version" class="form-label">Versión</label>
          <input
            type="number"
            class="form-control"
            id="version"
            v-model.number="form.version"
            min="1"
            placeholder="Versión del autor"
          />
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
  name: 'AuthorForm',
  props: {
    author: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        name: '',
        version: 1
      }
    }
  },
  computed: {
    isEditing() {
      return this.author !== null
    }
  },
  watch: {
    author: {
      handler(newAuthor) {
        if (newAuthor) {
          this.form = { ...newAuthor }
        } else {
          this.resetForm()
        }
      },
      immediate: true
    }
  },
  methods: {
    handleSubmit() {
      if (!this.form.name.trim()) {
        alert('El nombre del autor es requerido')
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
        name: '',
        version: 1
      }
    }
  }
}
</script>

<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Lista de Autores</h5>
      <span class="badge bg-secondary">{{ authors.length }} autores</span>
    </div>
    <div class="card-body">
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
      
      <div v-else-if="authors.length === 0" class="text-center text-muted">
        <i class="bi bi-person-x fs-1"></i>
        <p class="mt-2">No hay autores registrados</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Versión</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="author in authors" :key="author.id">
              <td>{{ author.id }}</td>
              <td>{{ author.name }}</td>
              <td>
                <span class="badge bg-info">v{{ author.version }}</span>
              </td>
              <td>
                <div class="btn-group" role="group">
                  <button 
                    class="btn btn-sm btn-outline-primary" 
                    @click="handleEdit(author)"
                    title="Editar autor"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger" 
                    @click="handleDelete(author.id)"
                    title="Eliminar autor"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthorList',
  props: {
    authors: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleEdit(author) {
      this.$emit('edit', author)
    },
    handleDelete(authorId) {
      this.$emit('delete', authorId)
    }
  }
}
</script>

<style scoped>
.table th {
  border-top: none;
}

.btn-group .btn {
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}
</style>

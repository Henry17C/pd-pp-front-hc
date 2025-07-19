<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Lista de Libros</h5>
      <span class="badge bg-secondary">{{ books.length }} libros</span>
    </div>
    <div class="card-body">
      <!-- Loading state -->
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2">Cargando libros...</p>
      </div>
      
      <!-- No data state -->
      <div v-else-if="books.length === 0" class="text-center text-muted">
        <i class="bi bi-book fs-1"></i>
        <p class="mt-2">No hay libros registrados</p>
        <button @click="$emit('reload')" class="btn btn-primary">Intentar cargar de nuevo</button>
      </div>

      <!-- Books table -->
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-dark">
            <tr>
              <th>ISBN</th>
              <th>Título</th>
              <th>Precio</th>
              <th>Inventario</th>
              <th>Autores</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in books" :key="book.isbn">
              <td>
                <code>{{ book.isbn }}</code>
              </td>
              <td>
                <strong>{{ book.title }}</strong>
              </td>
              <td>
                <span class="text-success fw-bold">${{ book.price?.toFixed(2) || '0.00' }}</span>
              </td>
              <td>
                <small class="text-muted">
                  <div>Vendido: {{ book.inventorySold || 0 }}</div>
                  <div>Disponible: {{ book.inventorySupplied || 0 }}</div>
                </small>
              </td>
              <td>
                <div v-if="book.authors && book.authors.length > 0">
                  <span 
                    v-for="(author, index) in book.authors" 
                    :key="index"
                    class="badge bg-info me-1 mb-1"
                  >
                    {{ author }}
                  </span>
                </div>
                <div v-else>
                  <span class="text-muted">Sin autores</span>
                </div>
              </td>
              <td>
                <div class="btn-group" role="group">
                  <button 
                    class="btn btn-sm btn-outline-primary" 
                    @click="$emit('edit', book)"
                    title="Editar libro"
                  >
                    <i class="bi bi-pencil"></i> Editar
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger" 
                    @click="$emit('delete', book.isbn)"
                    title="Eliminar libro"
                  >
                    <i class="bi bi-trash"></i> Eliminar
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
  name: 'BookList',
  props: {
    books: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit', 'delete', 'reload']
}
</script>

<style scoped>
.table-responsive {
  max-height: 500px;
  overflow-y: auto;
}

.btn-group .btn {
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

code {
  color: #e83e8c;
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
}
</style>

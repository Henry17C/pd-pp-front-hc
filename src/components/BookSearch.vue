<template>
  <div class="card">
    <div class="card-header">
      <h5 class="mb-0">Buscar Autores por Libro</h5>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSearch">
        <div class="row">
          <div class="col-md-8">
            <div class="mb-3">
              <label for="isbn" class="form-label">ISBN del Libro</label>
              <input
                type="text"
                class="form-control"
                id="isbn"
                v-model="isbn"
                placeholder="Ingrese el ISBN del libro"
                required
              />
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">&nbsp;</label>
              <div class="d-grid">
                <button type="submit" class="btn btn-success">
                  <i class="bi bi-search"></i>
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div v-if="bookAuthors.length > 0" class="mt-4">
        <h6>Autores encontrados:</h6>
        <div class="table-responsive">
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Versión</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="author in bookAuthors" :key="author.id">
                <td>{{ author.id }}</td>
                <td>{{ author.name }}</td>
                <td>
                  <span class="badge bg-info">v{{ author.version }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="searchPerformed && bookAuthors.length === 0" class="mt-4">
        <div class="alert alert-warning" role="alert">
          <i class="bi bi-exclamation-triangle"></i>
          No se encontraron autores para el ISBN: <strong>{{ lastSearchedIsbn }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookSearch',
  props: {
    bookAuthors: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      isbn: '',
      searchPerformed: false,
      lastSearchedIsbn: ''
    }
  },
  watch: {
    bookAuthors() {
      this.searchPerformed = true
    }
  },
  methods: {
    handleSearch() {
      if (!this.isbn.trim()) {
        alert('Por favor ingrese un ISBN válido')
        return
      }
      this.lastSearchedIsbn = this.isbn
      this.$emit('search', this.isbn.trim())
    }
  }
}
</script>

<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="#">Mi Libreria Land</a>
      </div>
    </nav>

    <div class="container mt-4">
      <!-- Navigation tabs -->
      <ul class="nav nav-tabs mb-4" id="mainTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'authors' }"
            @click="activeTab = 'authors'"
            type="button" 
            role="tab"
          >
            <i class="bi bi-person-fill"></i> Autores
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'books' }"
            @click="activeTab = 'books'"
            type="button" 
            role="tab"
          >
            <i class="bi bi-book-fill"></i> Libros
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'customers' }"
            @click="activeTab = 'customers'"
            type="button" 
            role="tab"
          >
            <i class="bi bi-people-fill"></i> Clientes
          </button>
        </li>
      </ul>

      <!-- Tab content -->
      <div class="tab-content" id="mainTabContent">
        <!-- Authors tab -->
        <div 
          class="tab-pane fade" 
          :class="{ 'show active': activeTab === 'authors' }"
          v-if="activeTab === 'authors'"
        >
          <!-- Formulario y Lista en una sola fila -->
          <div class="row">
            <div class="col-md-4">
              <AuthorForm 
                :author="autorSeleccionado" 
                @save="manejarGuardado" 
                @cancel="manejarCancelacion"
              />
            </div>
            <div class="col-md-8">
              <!-- Lista de autores con loading -->
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Lista de Autores</h5>
                  <span class="badge bg-secondary">{{ listaAutores.length }} autores</span>
                </div>
                <div class="card-body">
                  <!-- Loading state -->
                  <div v-if="estaCargando" class="text-center">
                    <div class="spinner-border" role="status">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando autores...</p>
                  </div>
                  
                  <!-- No data state -->
                  <div v-else-if="listaAutores.length === 0" class="text-center text-muted">
                    <i class="bi bi-person-x fs-1"></i>
                    <p class="mt-2">No hay autores registrados</p>
                    <button @click="cargarAutores" class="btn btn-primary">Intentar cargar de nuevo</button>
                  </div>

                  <!-- Authors table -->
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
                        <tr v-for="autor in listaAutores" :key="autor.id">
                          <td>{{ autor.id }}</td>
                          <td>{{ autor.name }}</td>
                          <td>
                            <span class="badge bg-info">v{{ autor.version }}</span>
                          </td>
                          <td>
                            <div class="btn-group" role="group">
                              <button 
                                class="btn btn-sm btn-outline-primary" 
                                @click="manejarEdicion(autor)"
                                title="Editar autor"
                              >
                                <i class="bi bi-pencil"></i> Editar
                              </button>
                              <button 
                                class="btn btn-sm btn-outline-danger" 
                                @click="manejarEliminacion(autor.id)"
                                title="Eliminar autor"
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
            </div>
          </div>

          <div class="row mt-4">
            <div class="col-md-12">
              <BookSearch @search="manejarBusquedaLibro" :bookAuthors="autoresDelLibro" />
            </div>
          </div>
        </div>

        <!-- Books tab -->
        <div 
          class="tab-pane fade" 
          :class="{ 'show active': activeTab === 'books' }"
          v-if="activeTab === 'books'"
        >
          <div class="row">
            <div class="col-md-4">
              <BookForm 
                :book="libroSeleccionado" 
                @save="manejarGuardadoLibro" 
                @cancel="manejarCancelacionLibro"
              />
            </div>
            <div class="col-md-8">
              <BookList 
                :books="listaLibros"
                :loading="estaCargandoLibros"
                @edit="manejarEdicionLibro"
                @delete="manejarEliminacionLibro"
                @reload="cargarLibros"
              />
            </div>
          </div>
        </div>

        <!-- Customers tab -->
        <div 
          class="tab-pane fade" 
          :class="{ 'show active': activeTab === 'customers' }"
          v-if="activeTab === 'customers'"
        >
          <div class="row">
            <div class="col-md-4">
              <CustomerForm 
                :customer="customerSeleccionado || {}"
                @save="manejarGuardadoCustomer" 
                @cancel="manejarCancelacionCustomer"
              />
            </div>
            <div class="col-md-8">
              <CustomerList 
                ref="customerList"
                @select="manejarSeleccionCustomer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthorForm from './components/AuthorForm.vue'
import BookForm from './components/BookForm.vue'
import BookList from './components/BookList.vue'
import BookSearch from './components/BookSearch.vue'
import CustomerForm from './components/CustomerForm.vue'
import CustomerList from './components/CustomerList.vue'
import AuthorService from './services/AuthorService'
import BookService from './services/BookService'

export default {
  name: 'App',
  components: {
    AuthorForm,
    BookForm,
    BookList,
    BookSearch,
    CustomerForm,
    CustomerList
  },
  data() {
    return {
      activeTab: 'authors',
      // Authors data
      listaAutores: [],
      autorSeleccionado: null,
      autoresDelLibro: [],
      estaCargando: false,
      // Books data
      listaLibros: [],
      libroSeleccionado: null,
      estaCargandoLibros: false,
      // Customers data
      customerSeleccionado: null
    }
  },
  async mounted() {
    console.log('App montada, cargando datos...')
    await this.cargarAutores()
    await this.cargarLibros()
  },
  watch: {
    activeTab(newTab) {
      // Load data when switching tabs if not already loaded
      if (newTab === 'books' && this.listaLibros.length === 0) {
        this.cargarLibros()
      } else if (newTab === 'authors' && this.listaAutores.length === 0) {
        this.cargarAutores()
      }
    }
  },
  methods: {
    // Authors methods
    async cargarAutores() {
      console.log('cargarAutores() llamado')
      this.estaCargando = true
      try {
        console.log('Llamando a AuthorService.getAllAuthors()...')
        this.listaAutores = await AuthorService.getAllAuthors()
        console.log('Autores cargados exitosamente:', this.listaAutores)
      } catch (error) {
        console.error('Error cargando autores:', error)
        alert('Error al cargar los autores: ' + error.message)
      } finally {
        this.estaCargando = false
        console.log('Loading finalizado, listaAutores.length:', this.listaAutores.length)
      }
    },
    async manejarGuardado(autor) {
      try {
        if (autor.id) {
          await AuthorService.updateAuthor(autor.id, autor)
        } else {
          await AuthorService.createAuthor(autor)
        }
        await this.cargarAutores()
        this.autorSeleccionado = null
      } catch (error) {
        console.error('Error guardando autor:', error)
        alert('Error al guardar el autor: ' + error.message)
      }
    },
    manejarEdicion(autor) {
      this.autorSeleccionado = { ...autor }
    },
    async manejarEliminacion(idAutor) {
      if (confirm('¿Estás seguro de que quieres eliminar este autor?')) {
        try {
          await AuthorService.deleteAuthor(idAutor)
          await this.cargarAutores()
        } catch (error) {
          console.error('Error eliminando autor:', error)
          
          // Verificar si es un error de restricción de clave foránea
          if (error.status === 500 || 
              error.message.includes('500') ||
              error.message.includes('constraint') || 
              error.message.includes('foreign key') || 
              error.message.includes('referenced') ||
              error.message.includes('integrity') ||
              error.status === 409) {
            alert('No se puede eliminar este autor porque está asociado a otra tabla (libros). Elimine primero las referencias antes de eliminar el autor.')
          } else {
            alert('Error al eliminar el autor: ' + error.message)
          }
        }
      }
    },
    manejarCancelacion() {
      this.autorSeleccionado = null
    },
    async manejarBusquedaLibro(isbn) {
      try {
        this.autoresDelLibro = await AuthorService.getAuthorsByBook(isbn)
      } catch (error) {
        console.error('Error buscando autores por libro:', error)
        alert('Error al buscar autores del libro: ' + error.message)
        this.autoresDelLibro = []
      }
    },

    // Books methods
    async cargarLibros() {
      console.log('cargarLibros() llamado')
      this.estaCargandoLibros = true
      try {
        console.log('Llamando a BookService.getAllBooks()...')
        this.listaLibros = await BookService.getAllBooks()
        console.log('Libros cargados exitosamente:', this.listaLibros)
      } catch (error) {
        console.error('Error cargando libros:', error)
        alert('Error al cargar los libros: ' + error.message)
      } finally {
        this.estaCargandoLibros = false
        console.log('Loading libros finalizado, listaLibros.length:', this.listaLibros.length)
      }
    },
    async manejarGuardadoLibro(libro) {
      try {
        if (this.libroSeleccionado) {
          // Es una edición
          await BookService.updateBook(libro.isbn, libro)
        } else {
          // Es una creación
          await BookService.createBook(libro)
        }
        await this.cargarLibros()
        this.libroSeleccionado = null
      } catch (error) {
        console.error('Error guardando libro:', error)
        alert('Error al guardar el libro: ' + error.message)
      }
    },
    manejarEdicionLibro(libro) {
      this.libroSeleccionado = { ...libro }
    },
    async manejarEliminacionLibro(isbn) {
      if (confirm('¿Estás seguro de que quieres eliminar este libro?')) {
        try {
          await BookService.deleteBook(isbn)
          await this.cargarLibros()
        } catch (error) {
          console.error('Error eliminando libro:', error)
          alert('Error al eliminar el libro: ' + error.message)
        }
      }
    },
    manejarCancelacionLibro() {
      this.libroSeleccionado = null
    },

    // Customers methods
    manejarSeleccionCustomer(customer) {
      this.customerSeleccionado = customer
    },
    async manejarGuardadoCustomer(customer) {
      try {
        // Actualizar la lista en el componente CustomerList
        if (this.$refs.customerList) {
          await this.$refs.customerList.actualizarDespuesDeGuardar(customer)
        }
        // Limpiar selección
        this.customerSeleccionado = null
      } catch (error) {
        console.error('Error en manejarGuardadoCustomer:', error)
      }
    },
    manejarCancelacionCustomer() {
      this.customerSeleccionado = null
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f8f9fa;
}
.btn-group .btn {
  margin-right: 2px;
}
.btn-group .btn:last-child {
  margin-right: 0;
}
</style>

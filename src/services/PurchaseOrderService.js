import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/app-customers'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
})

// Interceptor para logging
api.interceptors.request.use(
  config => {
    console.log('Realizando petición a Orders:', config.method.toUpperCase(), config.url)
    console.log('URL completa:', config.baseURL + config.url)
    return config
  },
  error => {
    console.error('Error en petición a Orders:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    console.log('Respuesta recibida de Orders:', response.status, response.data)
    return response
  },
  error => {
    console.error('Error en respuesta de Orders:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

class PurchaseOrderService {
  // Obtener todas las órdenes de un customer
  async getOrdersByCustomer(customerId) {
    try {
      const response = await api.get(`/orders/customer/${customerId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener órdenes del customer ${customerId}:`, error)
      throw this.handleError(error)
    }
  }

  // Obtener detalles de una orden específica
  async getOrderDetails(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener detalles de la orden ${orderId}:`, error)
      throw this.handleError(error)
    }
  }

  // Manejo de errores
  handleError(error) {
    if (error.response) {
      // El servidor respondió con un código de estado que no está en el rango 2xx
      const message = error.response.data?.message || `Error del servidor: ${error.response.status}`
      return new Error(message)
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      return new Error('No se pudo conectar con el servidor de órdenes. Verifique que esté ejecutándose en http://localhost:8080/app-customers')
    } else {
      // Algo sucedió al configurar la petición
      return new Error(`Error de configuración: ${error.message}`)
    }
  }

  // Formatear fecha para mostrar
  formatDate(dateString) {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Formatear precio
  formatPrice(price) {
    if (!price) return '$0.00'
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Obtener color del estado
  getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning'
      case 'delivered':
        return 'success'
      default:
        return 'secondary'
    }
  }

  // Obtener texto del estado en español
  getStatusText(status) {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Pendiente'
      case 'delivered':
        return 'Entregado'
      default:
        return 'Desconocido'
    }
  }

  // Calcular total de una orden
  calculateOrderTotal(lineItems) {
    if (!lineItems || lineItems.length === 0) return 0
    
    return lineItems.reduce((total, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0)
      return total + itemTotal
    }, 0)
  }
}

export default new PurchaseOrderService()

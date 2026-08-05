import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:'40px',textAlign:'center'}}>
          <h2>Something went wrong</h2>
          <p style={{color:'red'}}>{this.state.error?.message}</p>
          <button onClick={() => window.location.href='/'}>Go to Home</button>
        </div>
      )
    }
    return this.props.children
  }
}
export default ErrorBoundary

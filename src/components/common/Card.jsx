// ============================================
// FILE 3: src/components/common/Card.jsx
// ============================================
const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-xl shadow-soft p-6 transition-shadow hover:shadow-soft-lg ${className}`}
    {...props}
  >
    {children}
  </div>
)

export default Card

import React from 'react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="campusflow-footer bg-[#213448] text-white py-3 w-full z-100">
      <div className="campusflow-footer__content container mx-auto px-4">
        <span className="campusflow-footer__credit">
          CampusFlow Design Developed by <strong>Novaspire Tech</strong> {currentYear} ©
        </span>
      </div>
    </footer>
  )
}

export default Footer

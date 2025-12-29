import { FaUser, FaMapMarkerAlt, FaProjectDiagram } from 'react-icons/fa'

function ClientDetails({ formData, setFormData }) {
  return (
    <section className="client">
      <div className="client-card">
        <label>
          <span className="label-icon"><FaUser /></span>
          <span className="label-text">Client Name</span>
          <input 
            className="modern-input" 
            placeholder="Enter client name"
            value={formData.clientName}
            onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
          />
        </label>
      </div>
      <div className="client-card">
        <label>
          <span className="label-icon"><FaMapMarkerAlt /></span>
          <span className="label-text">Location</span>
          <input 
            className="modern-input" 
            placeholder="City / Address"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          />
        </label>
      </div>
      <div className="client-card">
        <label>
          <span className="label-icon"><FaProjectDiagram /></span>
          <span className="label-text">Project Title</span>
          <input 
            className="modern-input" 
            placeholder="Project Title"
            value={formData.projectTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
          />
        </label>
      </div>
    </section>
  )
}

export default ClientDetails

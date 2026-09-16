function Culture({ title, image, description }) {
  return (
    <div style={{ 
      width: "220px",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #e0e0e0",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      backgroundColor: "#fff",
      textAlign: "center",
      boxSizing: "border-box"
    }}>
      <img 
        src={image} 
        alt={title} 
        style={{ 
          width: "100%", 
          height: "130px", 
          objectFit: "cover", 
          borderRadius: "8px",
          display: "block"
        }}
      />
      <h3 style={{ fontSize: "16px", margin: "10px 0 6px 0", color: "#333" }}>{title}</h3>
      <p style={{ fontSize: "12px", color: "#666", margin: 0, lineHeight: "1.4" }}>{description}</p>
    </div>
  );
}

export default Culture;
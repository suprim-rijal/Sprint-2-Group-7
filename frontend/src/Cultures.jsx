// src/Cultures.jsx

import { useState } from "react";
import { cultureData } from "./data.js";
import Culture from "./Culture.jsx";

function Cultures() {
  const [data] = useState(cultureData);
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [index, setIndex] = useState(0);

  // Helper to get selected category object
  const selectedCatObj = data.find((cat) => cat.id === category);
  // Get current array of items (e.g., nepal festivals)
  const currentItems = selectedCatObj ? selectedCatObj[country] : [];
  // Get current single item
  const currentItem = currentItems[index];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", textAlign: "center" }}>
      <h1>Culture and Tradition</h1>

      {/* STEP 1: Select Country */}
      {country === "" ? (
        <div>
          <h2>Choose a Country</h2>
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "15px" }}>
            <button onClick={() => setCountry("nepal")}>Nepal</button>
            <button onClick={() => setCountry("ghana")}>Ghana</button>
          </div>
        </div>
      ) : 

      /* STEP 2: Select Category (Shown as Image Boxes) */
      category === "" ? (
        <div>
          <button onClick={() => setCountry("")}>Change Country</button>
          <h2>Choose a Category for {country.toUpperCase()}</h2>
          
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "20px", 
            justifyContent: "center", 
            marginTop: "20px" 
          }}>
            {data.map((cat) => (
              <div 
                key={cat.id} 
                onClick={() => { setCategory(cat.id); setIndex(0); }}
                style={{ 
                  cursor: "pointer", 
                  width: "160px", 
                  border: "1px solid #ccc", 
                  borderRadius: "8px", 
                  padding: "10px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  textAlign: "center"
                }}
              >
                <img 
                  src={cat[country][0].image} 
                  alt={cat.category} 
                  style={{ 
                    width: "100%", 
                    height: "100px", 
                    objectFit: "cover", 
                    borderRadius: "6px",
                    display: "block"
                  }}
                />
                <h3 style={{ fontSize: "14px", marginTop: "10px" }}>{cat.category}</h3>
              </div>
            ))}
          </div>
        </div>
      ) : 

      /* STEP 3: Display Active Item with Next/Prev */
      (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
          <button onClick={() => setCategory("")}>Back to Categories</button>
          <h2>{selectedCatObj.category} in {country.toUpperCase()}</h2>

          <Culture
            title={currentItem.title}
            image={currentItem.image}
            description={currentItem.description}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button 
              onClick={() => setIndex(index > 0 ? index - 1 : index)}
              disabled={index === 0}
            >
              Previous
            </button>

            <button 
              onClick={() => setIndex(index < currentItems.length - 1 ? index + 1 : index)}
              disabled={index === currentItems.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cultures;
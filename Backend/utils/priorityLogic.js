// priorityLogic.js
// yeh function report ki priority set karega based on catogory
const setPriority = (catogory,urgency,description) => {
  // agr urgency high hai toh wahi high return kar dega
  if( urgency && urgency.toLowerCase() === "high") return "high";

  // Step 2: Agar category high-risk hai (fire, flood, earthquake,storm,cyclone,tsunami) toh high priority
  const highRiskCategories = ["fire", "flood", "earthquake","storm","cyclone","tsunami"];
  if( catogory && highRiskCategories.includes(catogory.toLowerCase())) return "high";

  // agr category me medium risk h road accident, power outage , water shortage, heavy rain,landslide,electricity 
  const mediumRiskCategories = ["road accident", "power outage", "water shortage", "heavy rain","landslide","electricity"];
  if( catogory && mediumRiskCategories.includes(catogory.toLowerCase())) return "medium";

  //  Agar description mein urgent word hai toh high priority
  if(description && description.toLowerCase().includes("urgent")) return "high";

  // Step 4: Default case
  return "low";
};

module.exports = setPriority;

import axios from 'axios';

export const fetchData = async () => {
  try {
    const res = await axios.get("https://abhinav-chatbot-api.onrender.com/data");
    const data = res.data; 
    // console.log("Fetched Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return null;
  }
};

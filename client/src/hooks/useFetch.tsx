import { useState, useEffect } from "react";

const useFetch = (endpoint: string) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}${endpoint}`)
      .then((response) => {
        if (!response.ok) {
          // error coming back from server
          throw Error("could not fetch the data for that resource");
        }
        return response.json();
      })
      .then((data) => {
        setIsLoading(false);
        setData(data);
        setError(null);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err.message);
      });
  }, [endpoint]);

  return { data, isLoading, error };
};

export default useFetch;

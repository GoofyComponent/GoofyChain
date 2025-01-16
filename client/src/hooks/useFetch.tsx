import { useState, useEffect } from "react";
import useAuth from "./useAuth";

const API_URL = import.meta.env.VITE_API_URL;

const useFetch = (
  endpoint: string,
  bodyRequest?: BodyInit,
  headers?: HeadersInit,
  method: "GET" | "POST" = "GET",
  needAuth: boolean = true
) => {
  const { accessToken } = useAuth();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}${endpoint}`, {
      method: method,
      body: bodyRequest,
      headers: {
        ...headers,
        ...(needAuth && {
          Authorization: `Bearer ${accessToken}`,
        }),
      },
    })
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
  }, [endpoint, bodyRequest, headers, method, needAuth, accessToken]);

  return { data, isLoading, error };
};

export default useFetch;

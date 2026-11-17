import axios from "axios";
export const apiClient = axios.create({
  baseURL:"http://localhost:3030",
  withCredentials: true,
});
// Response Interceptor - API yanıtlarını logla
apiClient.interceptors.response.use(
  // ✅ Başarılı response
  (response) => {
    // console.log(`✅ API Success [${response.config.method?.toUpperCase()}] ${response.config.url}:`, {
    //   status: response.status,
    //   data: response.data,
    //   headers: response.headers,
    // });
    return response;
  },
(error) => {
  console.error(
    `❌ API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`,
    {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    }
  );
  return Promise.reject(error);
}
);

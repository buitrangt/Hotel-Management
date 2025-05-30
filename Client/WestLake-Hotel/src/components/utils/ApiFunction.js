/* eslint-disable no-useless-catch */
/* eslint-disable no-unused-vars */
import axios from "axios";

export const api = axios.create({
  // baseURL: import.meta.env.VITE_BASE_URL,
  baseURL: "http://localhost:9192",
});

export const getHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/* This function add a new room to the database*/
export async function addRoom(photo, roomType, roomPrice) {
  const formData = new FormData();
  formData.append("photo", photo);
  formData.append("roomType", roomType);
  formData.append("roomPrice", roomPrice);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");
  
  // Tạo header với Authorization token
  const headers = {
    Authorization: `Bearer ${token}`
  };
  // FormData không cần Content-Type, trình duyệt sẽ tự động thêm

  const response = await api.post("/rooms/add/new-room", formData, { headers });
  if (response.status === 201) {
    return true;
  } else {
    return false;
  }
}

/* This function gets all room types from the database */
export async function getRoomTypes() {
  try {
    const response = await api.get("/rooms/room/types", {
      headers: getHeader()
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching room types");
  }
}

/* This function gets all rooms from the database */
export async function getAllRooms() {
  try {
    const result = await api.get("/rooms/all-rooms", {
      headers: getHeader()
    });
    console.log(result.data);
    return result.data;
  } catch (error) {
    throw new Error("Error fetching rooms");
  }
}

/* This function delete a room by the Id*/
export async function deleteRoom(roomId) {
  try {
    const result = await api.delete(`rooms/delete/room/${roomId}`, {
      headers: getHeader()
    });
    return result.data;
  } catch (error) {
    throw new Error(`Error deleting room ${roomId}`);
  }
}

/* This function will update room */
export async function updateRoom(roomId, roomData) {
  const formData = new FormData();
  formData.append("photo", roomData.photo);
  formData.append("roomType", roomData.roomType);
  formData.append("roomPrice", roomData.roomPrice);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");
  
  // Tạo header với Authorization token
  const headers = {
    Authorization: `Bearer ${token}`
  };

  const response = await api.put(`/rooms/update/${roomId}`, formData, { headers });
  return response;
}

/* This function will get a room by Id */
export async function getRoomById(roomId) {
  try {
    const result = await api.get(`rooms/room/${roomId}`, {
      headers: getHeader()
    });
    return result.data;
  } catch (error) {
    throw new Error(`Error fetching room ${error.message}`);
  }
}

/* This function save a new booking to db*/
export async function bookRoom(roomId, booking) {
  try {
    console.log("Booking room ID:", roomId);
    console.log("Booking data:", booking);
    
    // Đảm bảo dữ liệu được định dạng đúng
    const bookingData = {
      ...booking,
      numOfAdults: parseInt(booking.numOfAdults) || 1,
      numOfChildren: parseInt(booking.numOfChildren) || 0
    };
    
    const response = await api.post(
      `/bookings/room/${roomId}/booking`,
      bookingData,
      { headers: getHeader() }
    );
    console.log("Booking response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error booking room:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    } else {
      throw new Error(`Error booking room : ${error.message}`);
    }
  }
}

/* This function get all booking from db*/
export async function getAllBookings() {
  try {
    const result = await api.get("/bookings/all-bookings", {
      headers: getHeader()
    });
    return result.data;
  } catch (error) {
    throw new Error(`Error fetching bookings : ${error.message}`);
  }
}

/* This function get booking by the confirmation code*/
export async function getBookingConfirmationCode(confirmationCode) {
  try {
    const result = await api.get(`/bookings/confirmation/${confirmationCode}`, {
      headers: getHeader()
    });
    return result.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data);
    } else {
      throw new Error(`Error find booking : ${error.message}`);
    }
  }
}

/* This function cancel booking */
export async function cancelBooking(bookingId) {
  try {
    const result = await api.delete(`/bookings/booking/${bookingId}/delete`, {
      headers: getHeader()
    });
    return result.data;
  } catch (error) {
    throw new Error(`Error cancelling booking: ${error.message}`);
  }
}

// this function gets all available  rooms from the database with a given checkInDate, checkOutDate and  roomType
export async function getAvailableRoom(checkInDate, checkOutDate, roomType) {
  const result = await api.get(
    `rooms/available-rooms?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomType=${roomType}`,
    { headers: getHeader() }
  );
  return result;
}

/* This function register a new user */
export async function registerUser(registration) {
  try {
    const response = await api.post("/auth/register-user", registration, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      // Kiểm tra nếu data là một object
      if (typeof error.response.data === 'object') {
        throw new Error(JSON.stringify(error.response.data) || 'Lỗi đăng ký người dùng');
      } else {
        throw new Error(error.response.data);
      }
    } else {
      throw new Error(`User registration error: ${error.message}`);
    }
  }
}



/* This function login a registered user */
export async function loginUser(login) {
  try {
    const response = await api.post("/auth/login", login);
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

/* This function get the user profile */
export async function getUserProfile(userId, token) {
  try {
    const response = await api.get(`users/profile/${userId}`, {
      headers: getHeader(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/* This function delete a user */
export async function deleteUser(userId) {
  try {
    console.log(userId);
    const response = await api.delete(`/users/delete/${userId}`, {
      headers: getHeader(),
    });
    return response.data;
  } catch (error) {
    return error.message;
  }
}

/* This function get a user */
export async function getUser(userId, token) {
  try {
    const response = await api.get(`/users/${userId}`, {
      headers: getHeader(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/* This is the function to get user bookings by the user id */
export async function getBookingsByUserId(userId, token) {
  try {
    const response = await api.get(`/bookings/user/${userId}/bookings`, {
      headers: getHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    throw new Error("Failed to fetch bookings");
  }
}

export async function getAllUsers() {
  try {
    const result = await api.get("/users/all", {
      headers: getHeader(),
    });
    console.log(result.data);
    return result.data;
  } catch (error) {
    console.log("2");
    throw new Error("Error fetching users");
  }
}

/* This function will update user */
export async function updateUser(roomId, roomData) {
  const formData = new FormData();
  formData.append("photo", roomData.photo);
  formData.append("roomType", roomData.roomType);
  formData.append("roomPrice", roomData.roomPrice);
  
  // Lấy token từ localStorage
  const token = localStorage.getItem("token");
  
  // Tạo header với Authorization token
  const headers = {
    Authorization: `Bearer ${token}`
  };
  
  const response = await api.put(`/rooms/update/${roomId}`, formData, { headers });
  return response;
}

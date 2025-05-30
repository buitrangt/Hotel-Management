import React, { useEffect, useState } from "react";
import { bookRoom, getRoomById } from "../utils/ApiFunction";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { Form, FormControl } from "react-bootstrap";
import BookingSummary from "./BookingSummary";

const BookingForm = () => {
  const [validated, setValidated] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomPrice, setRoomPrice] = useState(0);

  const currentUser = localStorage.getItem("userId");

  const [booking, setBooking] = useState({
    guestFullName: "",
    guestEmail: currentUser,
    checkInDate: "",
    checkOutDate: "",
    numOfAdults: 1,
    numOfChildren: 0,
  });

  const { roomId } = useParams();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Xử lý đặc biệt cho số
    if (name === "numOfAdults" || name === "numOfChildren") {
      setBooking({ ...booking, [name]: parseInt(value) || 0 });
    } else {
      setBooking({ ...booking, [name]: value });
    }
    setErrorMessage("");
  };

  const getRoomPriceById = async (roomId) => {
    try {
      const response = await getRoomById(roomId);
      console.log("Room details:", response);
      setRoomPrice(response.roomPrice);
    } catch (error) {
      console.error("Error fetching room:", error);
      setErrorMessage("Could not fetch room details: " + error.message);
    }
  };

  useEffect(() => {
    getRoomPriceById(roomId);
  }, [roomId]);

  const calculatePayment = () => {
    const checkInDate = moment(booking.checkInDate);
    const checkOutDate = moment(booking.checkOutDate);
    const diffInDays = checkOutDate.diff(checkInDate, "days");
    const paymentPerDay = roomPrice ? roomPrice : 0;
    return diffInDays * paymentPerDay;
  };

  const isGuestCountValid = () => {
    const adultCount = parseInt(booking.numOfAdults) || 0;
    const childrenCount = parseInt(booking.numOfChildren) || 0;
    const totalCount = adultCount + childrenCount;
    return totalCount >= 1 && adultCount >= 1;
  };

  const isCheckOutDateValid = () => {
    if (!booking.checkInDate || !booking.checkOutDate) return false;
    
    if (!moment(booking.checkOutDate).isAfter(moment(booking.checkInDate))) {
      setErrorMessage("Check-out date must be after check-in date");
      return false;
    } else {
      setErrorMessage("");
      return true;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (
      form.checkValidity() === false ||
      !isGuestCountValid() ||
      !isCheckOutDateValid()
    ) {
      e.stopPropagation();
    } else {
      setIsSubmitted(true);
    }
    setValidated(true);
  };

  const handleFormSubmit = async () => {
    try {
      console.log("Preparing to submit booking for room ID:", roomId);
      
      // Đảm bảo dữ liệu được định dạng đúng trước khi gửi
      const bookingData = {
        ...booking,
        numOfAdults: parseInt(booking.numOfAdults) || 1,
        numOfChildren: parseInt(booking.numOfChildren) || 0
      };
      
      console.log("Sending booking data:", bookingData);
      
      const confirmationCode = await bookRoom(roomId, bookingData);
      console.log("Booking successful! Confirmation code:", confirmationCode);
      
      setIsSubmitted(true);
      navigate("/booking-success", { state: { message: confirmationCode } });
    } catch (error) {
      console.error("Error during booking:", error);
      const errorMessage = error.message;
      navigate("/booking-success", { state: { error: errorMessage } });
    }
  };

  return (
    <>
      <div className="container mb-5">
        <div className="row ">
          <div className="col-md-6">
            <div className="card card-body mt-5">
              <h4 className="card-title">Reserve Room</h4>

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label htmlFor="guestFullName" className="hotel-color">
                    Fullname
                  </Form.Label>
                  <FormControl
                    required
                    type="text"
                    id="guestFullName"
                    name="guestFullName"
                    value={booking.guestFullName}
                    placeholder="Enter your full name"
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter your fullname
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group>
                  <Form.Label htmlFor="guestEmail" className="hotel-color">
                    Email
                  </Form.Label>
                  <FormControl
                    required
                    type="email"
                    id="guestEmail"
                    name="guestEmail"
                    value={booking.guestEmail}
                    placeholder="Enter your Email"
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter your Email Address
                  </Form.Control.Feedback>
                </Form.Group>
                <fieldset style={{ border: "2px" }}>
                  <legend>Lodging period</legend>
                  <div className="row">
                    <div className="col-6">
                      <Form.Label htmlFor="checkInDate" className="hotel-color">
                        Check-In date :
                      </Form.Label>
                      <FormControl
                        required
                        type="date"
                        id="checkInDate"
                        name="checkInDate"
                        value={booking.checkInDate}
                        placeholder="check-in date"
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please select a check in date
                      </Form.Control.Feedback>
                    </div>

                    <div className="col-6">
                      <Form.Label
                        htmlFor="checkOutDate"
                        className="hotel-color"
                      >
                        Check-Out date :
                      </Form.Label>
                      <FormControl
                        required
                        type="date"
                        id="checkOutDate"
                        name="checkOutDate"
                        value={booking.checkOutDate}
                        placeholder="check-out date"
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please select a check out date
                      </Form.Control.Feedback>
                    </div>
                    {errorMessage && (
                      <p className="error-message text-danger">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Number of Guest</legend>
                  <div className="row">
                    <div className="col-6">
                      <Form.Label htmlFor="numOfAdults" className="hotel-color">
                        Adults :
                      </Form.Label>
                      <FormControl
                        required
                        type="number"
                        id="numOfAdults"
                        name="numOfAdults"
                        value={booking.numOfAdults}
                        placeholder="0"
                        min={1}
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please select at least 1 adult.
                      </Form.Control.Feedback>
                    </div>

                    <div className="col-6">
                      <Form.Label
                        htmlFor="numOfChildren"
                        className="hotel-color"
                      >
                        Children :
                      </Form.Label>
                      <FormControl
                        type="number"
                        id="numOfChildren"
                        name="numOfChildren"
                        value={booking.numOfChildren}
                        placeholder="0"
                        min={0}
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Select 0 if no children
                      </Form.Control.Feedback>
                    </div>
                  </div>
                </fieldset>
                <div className="form-group mt-2 mb-2">
                  <button className="btn btn-hotel" type="submit">
                    Continue
                  </button>
                </div>
              </Form>
            </div>
          </div>
          <div className="col-md-4">
            {isSubmitted && (
              <BookingSummary
                booking={booking}
                payment={calculatePayment()}
                isFormValid={validated}
                onConfirm={handleFormSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingForm;

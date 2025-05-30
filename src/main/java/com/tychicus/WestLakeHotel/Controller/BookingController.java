package com.tychicus.WestLakeHotel.Controller;

import com.tychicus.WestLakeHotel.Exception.InvalidBookingRequestException;
import com.tychicus.WestLakeHotel.Exception.ResourceNotFoundException;
import com.tychicus.WestLakeHotel.Model.BookedRoom;
import com.tychicus.WestLakeHotel.Model.Room;
import com.tychicus.WestLakeHotel.Response.BookingResponse;
import com.tychicus.WestLakeHotel.Response.RoomResponse;
import com.tychicus.WestLakeHotel.Service.IBookingService;
import com.tychicus.WestLakeHotel.Service.IRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final IBookingService bookingService;
    private final IRoomService roomService;

    @GetMapping("/all-bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookedRoom> bookings = bookingService.getAllBookings();
        List<BookingResponse> bookingResponses = new ArrayList<>();
        for (BookedRoom booking : bookings) {
            BookingResponse bookingResponse = getBookingResponse(booking);
            bookingResponses.add(bookingResponse);
        }
        return ResponseEntity.ok(bookingResponses);
    }


    @GetMapping("/confirmation/{confirmationCode}")
    public ResponseEntity<?> getBookingByConfirmationCode(@PathVariable String confirmationCode) {
        try {
            BookedRoom booking = bookingService.findByBookingConfirmationCode(confirmationCode);
            BookingResponse bookingResponse = getBookingResponse(booking);
            return ResponseEntity.ok(bookingResponse);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @GetMapping("/user/{email}/bookings")
    public ResponseEntity<List<BookingResponse>> getBookingsByUserEmail(@PathVariable String email) {
        List<BookedRoom> bookings = bookingService.getBookingsByUserEmail(email);
        List<BookingResponse> bookingResponses = new ArrayList<>();
        for (BookedRoom booking : bookings) {
            BookingResponse bookingResponse = getBookingResponse(booking);
            bookingResponses.add(bookingResponse);
        }
        return ResponseEntity.ok(bookingResponses);
    }

    @PostMapping("/room/{roomId}/booking")
    public ResponseEntity<?> saveBooking(@PathVariable Long roomId, @RequestBody BookedRoom bookingRequest) {
        try {
            System.out.println("Received booking request for room ID: " + roomId);
            System.out.println("Guest name: " + bookingRequest.getGuestFullName());
            System.out.println("Check-in date: " + bookingRequest.getCheckInDate());
            System.out.println("Check-out date: " + bookingRequest.getCheckOutDate());
            System.out.println("Adults: " + bookingRequest.getNumOfAdults());
            System.out.println("Children: " + bookingRequest.getNumOfChildren());
            
            String confirmationCode = bookingService.saveBooking(roomId, bookingRequest);
            
            System.out.println("Booking successful with code: " + confirmationCode);
            return ResponseEntity.ok("Room booked successfully! your booking confirmation code is: " + confirmationCode);
        } catch (InvalidBookingRequestException e) {
            System.out.println("Booking failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @DeleteMapping("/booking/{bookingId}/delete")
    public void cancelBooking(@PathVariable Long bookingId) {
        bookingService.cancelBooking(bookingId);
    }

    private BookingResponse getBookingResponse(BookedRoom booking) {
        Room theRoom = roomService.getRoomById(booking.getRoom().getId()).get();
        RoomResponse room = new RoomResponse(theRoom.getId(), theRoom.getRoomType(), theRoom.getRoomPrice());
        return new BookingResponse(
                booking.getBookingId(), 
                booking.getCheckInDate(), 
                booking.getCheckOutDate(), 
                booking.getGuestFullName(), 
                booking.getGuestEmail(), 
                booking.getNumOfAdults(), 
                booking.getNumOfChildren(), 
                booking.getTotalNumOfGuest(), 
                booking.getBookingConfirmationCode(), 
                room);
    }
}

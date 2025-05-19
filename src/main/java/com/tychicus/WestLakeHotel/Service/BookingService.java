package com.tychicus.WestLakeHotel.Service;

import com.tychicus.WestLakeHotel.Exception.InvalidBookingRequestException;
import com.tychicus.WestLakeHotel.Exception.ResourceNotFoundException;
import com.tychicus.WestLakeHotel.Model.BookedRoom;
import com.tychicus.WestLakeHotel.Model.Room;
import com.tychicus.WestLakeHotel.Repository.BookingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService implements IBookingService {
    private final BookingRepository bookingRepository;
    private final IRoomService roomService;

    @Override
    public List<BookedRoom> getAllBookingsByRoomId(Long id) {
        return bookingRepository.findByRoomId(id);
    }

    @Override
    public void cancelBooking(Long bookingId) {
        bookingRepository.deleteById(bookingId);
    }

    @Override
    @Transactional
    public String saveBooking(Long roomId, BookedRoom bookingRequest) {
        if (bookingRequest.getCheckOutDate().isBefore(bookingRequest.getCheckInDate())) {
            throw new InvalidBookingRequestException("Check out date cannot be before check in date");
        }
        
        // Lấy phòng từ database
        Room room = roomService.getRoomById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        
        System.out.println("Processing booking request for room: " + room.getRoomType() + " (ID: " + room.getId() + ")");
        
        // Kiểm tra phòng có trống không
        List<BookedRoom> existingBookings = room.getBookings();
        boolean roomIsAvailable = roomIsAvailable(existingBookings, bookingRequest);
        
        if (roomIsAvailable) {
            try {
                // Thiết lập mối quan hệ 2 chiều
                String bookingCode = RandomStringUtils.randomNumeric(10);
                bookingRequest.setBookingConfirmationCode(bookingCode);
                bookingRequest.setRoom(room);
                
                // Tính tổng số khách
                int adults = bookingRequest.getNumOfAdults();
                int children = bookingRequest.getNumOfChildren();
                bookingRequest.setTotalNumOfGuest(adults + children);
                
                System.out.println("Setting room for booking: Room ID = " + room.getId());
                System.out.println("Setting booking code: " + bookingCode);
                
                // Thêm vào danh sách bookings của room
                if (room.getBookings() == null) {
                    room.setBookings(new ArrayList<>());
                }
                room.getBookings().add(bookingRequest);
                room.setBooked(true);
                
                // Lưu booking vào database
                BookedRoom savedBooking = bookingRepository.save(bookingRequest);
                System.out.println("Booking saved with ID: " + savedBooking.getBookingId());
                
                return bookingCode;
            } catch (Exception e) {
                System.out.println("Error saving booking: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to save booking: " + e.getMessage());
            }
        } else {
            throw new InvalidBookingRequestException("Sorry, This room is not available for the selected dates");
        }
    }

    @Override
    public BookedRoom findByBookingConfirmationCode(String confirmationCode) {
        return bookingRepository.findByBookingConfirmationCode(confirmationCode).orElseThrow(() -> new ResourceNotFoundException("No booking found with booking code " + confirmationCode));
    }

    @Override
    public List<BookedRoom> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public List<BookedRoom> getBookingsByUserEmail(String email) {
        return bookingRepository.findByGuestEmail(email);
    }

    private boolean roomIsAvailable(List<BookedRoom> existingBookings, BookedRoom bookingRequest) {
        // Nếu không có booking hiện tại, phòng luôn available
        if (existingBookings == null || existingBookings.isEmpty()) {
            return true;
        }
        
        return existingBookings.stream()
                .noneMatch(existingBooking ->
                        (bookingRequest.getCheckInDate().equals(existingBooking.getCheckInDate())
                        || bookingRequest.getCheckOutDate().equals(existingBooking.getCheckOutDate())
                        || (bookingRequest.getCheckInDate().isAfter(existingBooking.getCheckInDate()) 
                            && bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckOutDate()))
                        || (bookingRequest.getCheckOutDate().isAfter(existingBooking.getCheckInDate()) 
                            && bookingRequest.getCheckOutDate().isBefore(existingBooking.getCheckOutDate()))
                        || (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate()) 
                            && bookingRequest.getCheckOutDate().isAfter(existingBooking.getCheckOutDate())))
                );
    }
}

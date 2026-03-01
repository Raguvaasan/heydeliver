import { FC, useState } from "react";
import { Button, Card, Checkbox, Label, Select, Table } from "flowbite-react";
import { HiOutlineClock, HiOutlineCube } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";

interface Order {
  orderId: string;
  awb: string;
  manifestedDate: string;
  paymentMode: string;
}

const CreatePickupRequestPage: FC = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("TRUECARGO FRANCHISE");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState("Evening");
  const [showSlotDropdown, setShowSlotDropdown] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orders] = useState<Order[]>([]);

  // Available time slots
  const timeSlots = [
    {
      id: "mid-day",
      name: "Mid Day",
      icon: "☀️",
      time: "10:00:00 - 14:00:00",
    },
    {
      id: "evening",
      name: "Evening",
      icon: "🌙",
      time: "14:00:00 - 18:00:00",
    },
    {
      id: "late-evening",
      name: "Late Evening",
      icon: "🌃",
      time: "18:00:00 - 21:00:00",
    },
  ];

  // Generate next 3 available dates
  const getNextDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const availableDates = getNextDates();

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()]
    };
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreatePickup = async () => {
    if (orders.length === 0) {
      toast.error("No orders available to create pickup request");
      return;
    }

    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order");
      return;
    }

    try {
      // API call would go here
      toast.success("Pickup request created successfully");
      navigate("/orders/pickup");
    } catch (error) {
      toast.error("Failed to create pickup request");
    }
  };

  const handleCancel = () => {
    navigate("/orders/pickup");
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  return (
    <NavbarSidebarLayout>
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate("/orders/pickup")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Pickup Request</h1>
      </div>

      {/* Pickup Details Section */}
      <Card className="mb-6">
        <div className="flex items-center mb-4">
          <HiOutlineCube className="w-6 h-6 mr-2 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Pickup Details</h2>
        </div>

        {/* Pickup Location */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Label htmlFor="pickup-location" value="Pickup Location" />
            <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <Select
            id="pickup-location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option>TRUECARGO FRANCHISE</option>
          </Select>
        </div>

        {/* Pickup Date */}
        <div className="mb-6">
          <Label value="Pickup Date" className="mb-2 block" />
          <p className="text-sm text-gray-600 mb-3">
            Pickup will be attempted during the selected Pickup Slot
          </p>
          
          <div className="flex gap-3 mb-4">
            {availableDates.map((date, index) => {
              const { day, date: dateNum, month } = formatDate(date);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 min-w-[80px] transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span className="text-xs text-gray-600 mb-1">{day}</span>
                  <span className="text-2xl font-bold text-gray-900">{dateNum}</span>
                  <span className="text-xs text-gray-600">{month}</span>
                </button>
              );
            })}
          </div>

          <p className="text-sm text-red-600">
            For Next Day Delivery shipments, please ensure pickup is scheduled before 6:00 PM
          </p>
        </div>

        {/* Default Pickup Slot */}
        <div className="mb-4">
          <Label value="Default Pickup Slot" className="mb-3 block" />
          
          <div className="relative">
            <div 
              onClick={() => setShowSlotDropdown(!showSlotDropdown)}
              className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center">
                <HiOutlineClock className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  {timeSlots.find(slot => slot.name === selectedSlot)?.name} {timeSlots.find(slot => slot.name === selectedSlot)?.time}
                </span>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSlot("Evening");
                  setShowSlotDropdown(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Dropdown Menu */}
            {showSlotDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlot(slot.name);
                      setShowSlotDropdown(false);
                    }}
                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedSlot === slot.name ? "bg-blue-50" : ""
                    }`}
                  >
                    <span className="text-2xl mr-3">{slot.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{slot.name}</div>
                      <div className="text-sm text-gray-500">{slot.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center">
              <Checkbox
                id="save-default"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
              />
              <Label htmlFor="save-default" className="ml-2 text-sm">
                Save this as the default pickup slot for this location
              </Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Orders Table Section */}
      <Card>
        <div className="flex items-center mb-4">
          <HiOutlineCube className="w-6 h-6 mr-2 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Orders ready to be shipped from {selectedLocation}
          </h2>
          <svg className="w-4 h-4 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.HeadCell className="p-4">
                <Checkbox
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders(orders.map(o => o.orderId));
                    } else {
                      setSelectedOrders([]);
                    }
                  }}
                />
              </Table.HeadCell>
              <Table.HeadCell>ORDER ID AND AWB</Table.HeadCell>
              <Table.HeadCell>MANIFESTED DATE</Table.HeadCell>
              <Table.HeadCell>PAYMENT MODE</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {orders.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-500 font-medium">No Records Found</p>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                orders.map((order) => (
                  <Table.Row key={order.orderId} className="bg-white hover:bg-gray-50">
                    <Table.Cell className="p-4">
                      <Checkbox
                        checked={selectedOrders.includes(order.orderId)}
                        onChange={() => toggleOrderSelection(order.orderId)}
                      />
                    </Table.Cell>
                    <Table.Cell className="font-medium text-gray-900">
                      {order.orderId}
                      <br />
                      <span className="text-sm text-gray-500">{order.awb}</span>
                    </Table.Cell>
                    <Table.Cell>{order.manifestedDate}</Table.Cell>
                    <Table.Cell>{order.paymentMode}</Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <Button color="gray" onClick={handleCancel}>
          Cancel
        </Button>
        <Button color="dark" onClick={handleCreatePickup}>
          Create Pickup Request
        </Button>
      </div>
    </div>
    </NavbarSidebarLayout>
  );
};

export default CreatePickupRequestPage;

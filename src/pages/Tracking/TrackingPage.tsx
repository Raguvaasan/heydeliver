import { FC, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, TextInput, Badge, Timeline } from "flowbite-react";
import { HiSearch, HiLocationMarker, HiClock, HiCheckCircle } from "react-icons/hi";
import toast from "react-hot-toast";

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
  icon: string;
}

const TrackingPage: FC = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);

  // Sample tracking data
  const sampleTrackingData = {
    awb: "HEY123456789",
    currentStatus: "In Transit",
    origin: "Chennai, Tamil Nadu",
    destination: "Mumbai, Maharashtra",
    estimatedDelivery: "Jan 17, 2026",
    weight: "2.5 kg",
    shipmentType: "Surface",
    events: [
      {
        status: "Delivered",
        location: "Mumbai, Maharashtra",
        timestamp: "2026-01-17 14:30:00",
        description: "Package delivered successfully",
        icon: "check",
      },
      {
        status: "Out for Delivery",
        location: "Mumbai Hub",
        timestamp: "2026-01-17 09:00:00",
        description: "Package is out for delivery",
        icon: "truck",
      },
      {
        status: "In Transit",
        location: "Pune Hub",
        timestamp: "2026-01-16 18:45:00",
        description: "Package arrived at Pune Hub",
        icon: "location",
      },
      {
        status: "In Transit",
        location: "Bangalore Hub",
        timestamp: "2026-01-16 06:30:00",
        description: "Package in transit to next hub",
        icon: "location",
      },
      {
        status: "Picked Up",
        location: "Chennai, Tamil Nadu",
        timestamp: "2026-01-15 15:20:00",
        description: "Package picked up from sender",
        icon: "pickup",
      },
      {
        status: "Manifested",
        location: "Chennai Hub",
        timestamp: "2026-01-15 10:00:00",
        description: "Shipment details received",
        icon: "document",
      },
    ],
  };

  const handleTrack = () => {
    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }

    setIsTracking(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingData(sampleTrackingData);
      setIsTracking(false);
      toast.success("Tracking information loaded");
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      Delivered: "success",
      "Out for Delivery": "info",
      "In Transit": "warning",
      "Picked Up": "purple",
      Manifested: "gray",
    };
    return statusColors[status] || "gray";
  };

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Track Your Shipment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter your AWB/Tracking number to track your shipment
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <TextInput
                icon={HiSearch}
                placeholder="Enter AWB / Tracking Number (e.g., HEY123456789)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                sizing="lg"
              />
            </div>
            <Button
              color="dark"
              size="lg"
              onClick={handleTrack}
              isProcessing={isTracking}
            >
              <HiSearch className="mr-2 h-5 w-5" />
              Track
            </Button>
          </div>

          <div className="mt-3">
            <p className="text-sm text-gray-500">
              Example AWB: HEY123456789, HEY987654321
            </p>
          </div>
        </Card>

        {/* Tracking Results */}
        {trackingData && (
          <>
            {/* Shipment Summary */}
            <Card className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    AWB: {trackingData.awb}
                  </h2>
                  <Badge color={getStatusColor(trackingData.currentStatus)} size="lg">
                    {trackingData.currentStatus}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {trackingData.estimatedDelivery}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <HiLocationMarker className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Origin</p>
                    <p className="font-medium text-gray-900">{trackingData.origin}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <HiLocationMarker className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="font-medium text-gray-900">
                      {trackingData.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg
                        className="h-5 w-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="font-medium text-gray-900">{trackingData.weight}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <svg
                        className="h-5 w-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-900">
                      {trackingData.shipmentType}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Shipment Journey */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Shipment Journey
              </h3>

              <Timeline>
                {trackingData.events.map((event: TrackingEvent, index: number) => (
                  <Timeline.Item key={index}>
                    <Timeline.Point
                      icon={
                        event.icon === "check" ? (
                          HiCheckCircle
                        ) : event.icon === "clock" ? (
                          HiClock
                        ) : (
                          HiLocationMarker
                        )
                      }
                    />
                    <Timeline.Content>
                      <Timeline.Time>{event.timestamp}</Timeline.Time>
                      <Timeline.Title>{event.status}</Timeline.Title>
                      <Timeline.Body>
                        <div className="flex items-center gap-2">
                          <HiLocationMarker className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {event.location}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                      </Timeline.Body>
                    </Timeline.Content>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            {/* Map Placeholder */}
            <Card className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Shipment Route
              </h3>
              <div className="bg-gray-100 rounded-lg p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <p className="text-gray-500">Map view coming soon</p>
              </div>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!trackingData && !isTracking && (
          <Card>
            <div className="text-center py-12">
              <svg
                className="w-20 h-20 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Track Your Shipment
              </h3>
              <p className="text-gray-500 mb-6">
                Enter your tracking number above to see real-time updates
              </p>
            </div>
          </Card>
        )}
      </div>
    </NavbarSidebarLayout>
  );
};

export default TrackingPage;

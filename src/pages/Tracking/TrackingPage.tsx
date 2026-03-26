import { FC, useState } from "react";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Card, Button, TextInput, Badge, Timeline } from "flowbite-react";
import { HiSearch, HiLocationMarker, HiClock, HiCheckCircle } from "react-icons/hi";
import toast from "react-hot-toast";

interface DelhiveryScanDetail {
  Instructions?: string;
  Scan?: string;
  ScanDateTime?: string;
  ScannedLocation?: string;
  StatusDateTime?: string;
}

interface DelhiveryShipment {
  AWB?: string;
  ChargedWeight?: number | null;
  InvoiceAmount?: number | string | null;
  CODAmount?: number | string | null;
  [key: string]: unknown;
  Destination?: string;
  ExpectedDeliveryDate?: string | null;
  OrderType?: string;
  Origin?: string;
  PromisedDeliveryDate?: string | null;
  ReturnPromisedDeliveryDate?: string | null;
  Scans?: Array<{ ScanDetail?: DelhiveryScanDetail }>;
  Status?: {
    Status?: string;
  };
}

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
  icon: string;
}

interface TrackingViewData {
  awb: string;
  currentStatus: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  amount: string;
  shipmentType: string;
  events: TrackingEvent[];
}

const TrackingPage: FC = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingViewData | null>(null);

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const mapShipmentToViewData = (shipment: DelhiveryShipment): TrackingViewData => {
    const scans = (shipment.Scans || [])
      .map((item) => item.ScanDetail)
      .filter(Boolean) as DelhiveryScanDetail[];

    const events: TrackingEvent[] = scans
      .map((scan) => {
        const status = scan.Scan || "Update";
        const lowerStatus = status.toLowerCase();
        let icon = "location";
        const rawTimestamp = scan.StatusDateTime || scan.ScanDateTime || "";

        if (lowerStatus.includes("delivered")) icon = "check";
        else if (lowerStatus.includes("out for delivery")) icon = "clock";

        return {
          rawTimestamp,
          status,
          location: scan.ScannedLocation || "-",
          timestamp: formatDateTime(rawTimestamp),
          description: scan.Instructions || "-",
          icon,
        };
      })
      .sort((a, b) => {
        const first = new Date(a.rawTimestamp).getTime();
        const second = new Date(b.rawTimestamp).getTime();
        return Number.isNaN(second - first) ? 0 : second - first;
      })
      .map(({ rawTimestamp: _rawTimestamp, ...event }) => event);

    const shipmentRecord = shipment as Record<string, unknown>;
    const discoveredAmount = Object.entries(shipmentRecord).find(([key, value]) => {
      if (value === null || value === undefined) return false;
      if (String(value).trim() === "") return false;
      return /(invoice[_\s-]*amount|cod[_\s-]*amount|amount)/i.test(key);
    })?.[1];

    const rawAmount =
      shipment.InvoiceAmount ??
      shipment.CODAmount ??
      shipment["invoice_amount"] ??
      shipment["invoiceAmount"] ??
      shipment["Invoice_Amount"] ??
      shipment["amount"] ??
      discoveredAmount;
    const hasAmount =
      rawAmount !== null &&
      rawAmount !== undefined &&
      String(rawAmount).trim() !== "";
    const parsedAmount = hasAmount ? Number(rawAmount) : NaN;
    const amountText = !hasAmount
      ? "-"
      : Number.isFinite(parsedAmount)
        ? `Rs ${parsedAmount}`
        : `Rs ${String(rawAmount).trim()}`;

    return {
      awb: shipment.AWB || trackingNumber,
      currentStatus: shipment.Status?.Status || "Unknown",
      origin: shipment.Origin || "-",
      destination: shipment.Destination || "-",
      estimatedDelivery: formatDateTime(
        shipment.ExpectedDeliveryDate ||
          shipment.PromisedDeliveryDate ||
          shipment.ReturnPromisedDeliveryDate
      ),
      amount: amountText,
      shipmentType: shipment.OrderType || "-",
      events,
    };
  };

  const handleTrack = async () => {
    const cleanTrackingNumber = trackingNumber.trim();
    if (!cleanTrackingNumber) {
      toast.error("Please enter a tracking number");
      return;
    }

    setIsTracking(true);

    try {
      const response = await fetch(
        `/delhivery-api/api/v1/packages/json/?waybill=${encodeURIComponent(cleanTrackingNumber)}`,
        { method: "GET" }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch tracking details");
      }

      const data = await response.json();
      const shipmentNode = data?.ShipmentData?.[0];
      const shipment = (shipmentNode?.Shipment || shipmentNode) as DelhiveryShipment | undefined;

      if (!shipment?.AWB) {
        setTrackingData(null);
        toast.error("No tracking details found for this AWB");
        return;
      }

      setTrackingData(mapShipmentToViewData(shipment));
      toast.success("Tracking information loaded");
    } catch (error: any) {
      setTrackingData(null);
      toast.error(error?.message || "Failed to fetch tracking details");
    } finally {
      setIsTracking(false);
    }
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
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                sizing="lg"
              />
            </div>
            <Button
              color="dark"
              size="lg"
              onClick={handleTrack}
              disabled={isTracking}
            >
              <HiSearch className="mr-2 h-5 w-5" />
              {isTracking ? "Tracking..." : "Track"}
            </Button>
          </div>

          <div className="mt-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your Delhivery AWB (waybill) and click Track.
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
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    AWB: {trackingData.awb}
                  </h2>
                  <Badge color={getStatusColor(trackingData.currentStatus)} size="lg">
                    {trackingData.currentStatus}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Delivery</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Origin</p>
                    <p className="font-medium text-gray-900 dark:text-white">{trackingData.origin}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <HiLocationMarker className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Destination</p>
                    <p className="font-medium text-gray-900 dark:text-white">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">{trackingData.amount || "-"}</p>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trackingData.shipmentType}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Shipment Journey */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Shipment Journey
              </h3>

              <Timeline>
                {trackingData.events.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No scan events available yet.</p>
                ) : (
                  trackingData.events.map((event: TrackingEvent, index: number) => (
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
                        <Timeline.Time className="text-gray-500 dark:text-gray-400">{event.timestamp}</Timeline.Time>
                        <Timeline.Title className="text-gray-900 dark:text-white">{event.status}</Timeline.Title>
                        <Timeline.Body>
                          <div className="flex items-center gap-2">
                            <HiLocationMarker className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {event.location}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {event.description}
                          </p>
                        </Timeline.Body>
                      </Timeline.Content>
                    </Timeline.Item>
                  ))
                )}
              </Timeline>
            </Card>

            {/* Map Placeholder */}
            {/* <Card className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Shipment Route
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4"
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
                <p className="text-gray-500 dark:text-gray-400">Map view coming soon</p>
              </div>
            </Card> */}
          </>
        )}

        {/* Empty State */}
        {!trackingData && !isTracking && (
          <Card>
            <div className="text-center py-12">
              <svg
                className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4"
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Track Your Shipment
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
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

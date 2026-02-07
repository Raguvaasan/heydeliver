import { FC, useState, useEffect } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card, Button, TextInput, Badge, Spinner, Tabs } from "flowbite-react"
import http from "../../common/httpRequest"
import toast from "react-hot-toast"
import { HiSearch, HiDownload, HiEye } from "react-icons/hi"

interface Invoice {
  _id: string
  invoiceId: string
  invoiceDate: string
  gstNumber: string
  serviceType: string
  invoiceAmount: number
  status?: string
}

const InvoicePage: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("invoices")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [creditNotes, setCreditNotes] = useState<any[]>([])
  const [debitNotes, setDebitNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({
    startDate: "16 Dec 2025",
    endDate: "15 Jan 2026"
  })

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await http.get("/admin/invoice")
      console.log("Invoice response:", response.data)
      setInvoices(response.data?.data || [])
    } catch (error: any) {
      console.error("Error fetching invoices:", error)
      if (error.response?.status !== 401) {
        toast.error("Failed to fetch invoices")
      }
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCreditNotes = async () => {
    setLoading(true)
    try {
      const response = await http.get("/admin/credit-notes")
      setCreditNotes(response.data?.data || [])
    } catch (error: any) {
      console.error("Error fetching credit notes:", error)
      setCreditNotes([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDebitNotes = async () => {
    setLoading(true)
    try {
      const response = await http.get("/admin/debit-notes")
      setDebitNotes(response.data?.data || [])
    } catch (error: any) {
      console.error("Error fetching debit notes:", error)
      setDebitNotes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "invoices") {
      fetchInvoices()
    } else if (activeTab === "credit") {
      fetchCreditNotes()
    } else if (activeTab === "debit") {
      fetchDebitNotes()
    }
  }, [activeTab])

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invoices
          </h1>
        </div>

        <Card>
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("invoices")}
                className={`pb-3 font-medium transition-colors ${
                  activeTab === "invoices"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                Invoice List
              </button>
              {/* <button
                onClick={() => setActiveTab("credit")}
                className={`pb-3 font-medium transition-colors ${
                  activeTab === "credit"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                Credit Notes
              </button>
              <button
                onClick={() => setActiveTab("debit")}
                className={`pb-3 font-medium transition-colors ${
                  activeTab === "debit"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                Debit Notes
              </button> */}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <TextInput
                id="search"
                type="text"
                icon={HiSearch}
                placeholder={
                  activeTab === "invoices"
                    ? "Search by invoice ID"
                    : "Search by note ID"
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button color="gray" className="whitespace-nowrap">
              Date Range: {dateRange.startDate} to {dateRange.endDate}
            </Button>
          </div>

          {/* Invoice List Table */}
          {activeTab === "invoices" && (
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="xl" />
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700 text-xs uppercase dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">INVOICE ID</th>
                      <th className="px-6 py-3">INVOICE DATE</th>
                      <th className="px-6 py-3">GST NUMBER</th>
                      <th className="px-6 py-3">SERVICE TYPE</th>
                      <th className="px-6 py-3">INVOICE AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <tr
                          key={invoice._id}
                          className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {invoice.invoiceId}
                          </td>
                          <td className="px-6 py-4">{invoice.invoiceDate}</td>
                          <td className="px-6 py-4">{invoice.gstNumber || "-"}</td>
                          <td className="px-6 py-4">{invoice.serviceType || "-"}</td>
                          <td className="px-6 py-4">₹{invoice.invoiceAmount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No Records Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Credit Notes Table */}
          {activeTab === "credit" && (
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="xl" />
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700 text-xs uppercase dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">NOTE ID</th>
                      <th className="px-6 py-3">ISSUED DATE</th>
                      <th className="px-6 py-3">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditNotes.length > 0 ? (
                      creditNotes.map((note) => (
                        <tr
                          key={note._id}
                          className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {note.noteId}
                          </td>
                          <td className="px-6 py-4">{note.issuedDate}</td>
                          <td className="px-6 py-4">₹{note.amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No Records Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Debit Notes Table */}
          {activeTab === "debit" && (
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="xl" />
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700 text-xs uppercase dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">NOTE ID</th>
                      <th className="px-6 py-3">ISSUED DATE</th>
                      <th className="px-6 py-3">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debitNotes.length > 0 ? (
                      debitNotes.map((note) => (
                        <tr
                          key={note._id}
                          className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {note.noteId}
                          </td>
                          <td className="px-6 py-4">{note.issuedDate}</td>
                          <td className="px-6 py-4">₹{note.amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No Records Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500">
              Showing 1 - 0 of 0
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show</span>
              <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option>50</option>
                <option>100</option>
                <option>200</option>
              </select>
              <span className="text-sm text-gray-500">per page</span>
            </div>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default InvoicePage

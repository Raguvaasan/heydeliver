import { FC, useEffect, useState } from "react"
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar"
import { Badge, Button, Card, Label, Select, Spinner, Table, TextInput } from "flowbite-react"
import { HiEye, HiPlus, HiSearch } from "react-icons/hi"
import BranchWalletAddModal from "./BranchWalletAddModal"
import ViewBranchWalletModal from "./ViewBranchWalletModal"
import { BranchWallet, useBranchWalletStore } from "../../../store/branchWalletStore"

const PAGE_SIZE = 10

const BranchWalletPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const { branchWallets, loading, pagination, fetchBranchWallets, selectedBranchWallet, setSelectedBranchWallet } = useBranchWalletStore()

  useEffect(() => {
    fetchBranchWallets({
      page,
      limit: PAGE_SIZE,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    })
  }, [fetchBranchWallets, page, searchTerm, statusFilter])

  const handleView = (item: BranchWallet) => {
    setSelectedBranchWallet(item)
    setIsViewOpen(true)
  }

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage branch wallet balances and credits</p>
          </div>
          <Button color="warning" className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsAddOpen(true)}>
            <HiPlus className="mr-2 h-5 w-5" />
            ADD
          </Button>
        </div>

        <Card>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <Label value="Search" />
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <TextInput
                  type="search"
                  placeholder="Search by branch name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full lg:w-56">
              <Label value="Status" />
              <Select className="mt-2" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }}>
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head className="bg-gray-800 text-white">
                <Table.HeadCell>Agency Name</Table.HeadCell>
                <Table.HeadCell>Wallet Balance</Table.HeadCell>
                <Table.HeadCell>Profit</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell className="text-center">Action</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={5}>
                      <div className="flex items-center justify-center py-8">
                        <Spinner size="lg" />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : branchWallets.length > 0 ? (
                  branchWallets.map((item, index) => (
                    <Table.Row key={item.id || index}>
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">{item.branchName || "-"}</Table.Cell>
                      <Table.Cell>₹ {(Number(item.walletBalance) || 0).toLocaleString()}</Table.Cell>
                      <Table.Cell>₹ {(Number(item.profit) || 0).toLocaleString()}</Table.Cell>
                      <Table.Cell>
                        <Badge color={String(item.status || "").toLowerCase() === "active" ? "success" : "failure"}>
                          {item.status || "Unknown"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="text-center">
                        <button
                          onClick={() => handleView(item)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          title="View"
                          type="button"
                        >
                          <HiEye className="h-5 w-5" />
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="py-10 text-center text-gray-500">No branch wallets found</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Page {pagination?.page || 1} of {pagination?.totalPages || 1} · {pagination?.total || 0} records
            </span>
            <div className="flex gap-2">
              <Button size="xs" color="light" disabled={(pagination?.page || 1) <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button size="xs" color="light" disabled={(pagination?.page || 1) >= (pagination?.totalPages || 1) || loading} onClick={() => setPage((p) => Math.min(pagination?.totalPages || 1, p + 1))}>Next</Button>
            </div>
          </div>
        </Card>
      </div>

      <BranchWalletAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchBranchWallets}
      />

      <ViewBranchWalletModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        item={selectedBranchWallet}
      />
    </NavbarSidebarLayout>
  )
}

export default BranchWalletPage

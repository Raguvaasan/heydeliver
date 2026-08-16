import { FC, useEffect, useState } from "react"
import NavbarSidebarLayout from "../../../layouts/navbar-sidebar"
import { Badge, Button, Card, Label, Spinner, Table, TextInput } from "flowbite-react"
import { HiPlus, HiSearch } from "react-icons/hi"
import ProfitPercentageAddModal from "./ProfitPercentageAddModal"
import { useProfitPercentageStore } from "../../../store/profitPercentageStore"

const PAGE_SIZE = 10

const ProfitPercentagePage: FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const { items, loading, pagination, fetchItems } = useProfitPercentageStore()

  useEffect(() => {
    fetchItems({
      page,
      limit: PAGE_SIZE,
      search: searchTerm || undefined,
    })
  }, [fetchItems, page, searchTerm])

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profit Percentage</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage profit, loading and misc charge percentages for agencies</p>
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
                  placeholder="Search by agency name"
                  value={searchTerm}
                  onChange={(e) => {
                    setPage(1)
                    setSearchTerm(e.target.value)
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head className="bg-gray-800 text-white">
                <Table.HeadCell>Agency Name</Table.HeadCell>
                <Table.HeadCell>Profit Percentage</Table.HeadCell>
                <Table.HeadCell>Loading Charge</Table.HeadCell>
                <Table.HeadCell>Misc Charge</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={4}>
                      <div className="flex items-center justify-center py-8">
                        <Spinner size="lg" />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : items.length > 0 ? (
                  items.map((item, index) => (
                    <Table.Row key={item.id || index}>
                      <Table.Cell className="font-medium text-gray-900 dark:text-white">{item.agencyName || "-"}</Table.Cell>
                      <Table.Cell>{Number(item.profitPercentage || 0)}%</Table.Cell>
                      <Table.Cell>{Number(item.loadingChargePercentage || 0)}%</Table.Cell>
                      <Table.Cell>{Number(item.miscChargePercentage || 0)}%</Table.Cell>
                      <Table.Cell>
                        <Badge color={String(item.status || "").toLowerCase() === "active" ? "success" : "failure"}>
                          {item.status || "Unknown"}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={4} className="py-10 text-center text-gray-500">No profit percentages found</Table.Cell>
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

      <ProfitPercentageAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => fetchItems({ page, limit: PAGE_SIZE, search: searchTerm || undefined })}
      />
    </NavbarSidebarLayout>
  )
}

export default ProfitPercentagePage

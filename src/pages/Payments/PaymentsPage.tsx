import { FC } from "react"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { Card } from "flowbite-react"

const PaymentsPage: FC = () => {
  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payments
          </h1>
        </div>

        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Payments page - Coming soon</p>
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default PaymentsPage

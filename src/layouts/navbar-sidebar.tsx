import { Footer } from "flowbite-react"
import { FC, PropsWithChildren, useState } from "react"

import { MdFacebook } from "react-icons/md"
import { FaDribbble, FaGithub, FaInstagram, FaTwitter } from "react-icons/fa"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

interface NavbarSidebarLayoutProps {
  isFooter?: boolean
  children: React.ReactNode
}

const NavbarSidebarLayout: FC<NavbarSidebarLayoutProps> = ({
  isFooter,
  children,
}) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#1f1f1f]">
      {/* Sidebar Component */}
      <Sidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Section */}
      <div
        className={`transition-all duration-300 ${
          isSidebarExpanded
            ? "lg:ml-64 lg:w-[calc(100%-16rem)]"
            : "lg:ml-20 lg:w-[calc(100%-5rem)]"
        }`}
      >
        {/* Navbar */}
        <Navbar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
        />

        {/* Main Content */}
        <MainContent isFooter={isFooter}>{children}</MainContent>
      </div>
    </div>
  )
}

const MainContent: FC<PropsWithChildren<{ isFooter?: boolean }>> = ({
  children,
  isFooter,
}) => {
  return (
    <main className="pt-16 min-h-screen bg-gray-50 dark:bg-[#1f1f1f] transition-all duration-300">
      <div className="p-6">{children}</div>
      {isFooter && (
        <div className="mx-4 mt-4">
          <MainContentFooter />
        </div>
      )}
    </main>
  )
}

const MainContentFooter: FC = () => {
  return (
    <>
      <Footer container>
        <div className="flex w-full flex-col gap-y-6 lg:flex-row lg:justify-between">
          <Footer.LinkGroup>
            <Footer.Link href="#">Terms and Conditions</Footer.Link>
            <Footer.Link href="#">Privacy Policy</Footer.Link>
            <Footer.Link href="#">Licensing</Footer.Link>
            <Footer.Link href="#">Cookie Policy</Footer.Link>
            <Footer.Link href="#">Contact</Footer.Link>
          </Footer.LinkGroup>
          <Footer.LinkGroup>
            <div className="flex gap-x-1">
              <Footer.Link href="#">
                <MdFacebook className="text-lg hover:text-black" />
              </Footer.Link>
              <Footer.Link href="#">
                <FaInstagram className="text-lg hover:text-black" />
              </Footer.Link>
              <Footer.Link href="#">
                <FaTwitter className="text-lg hover:text-black" />
              </Footer.Link>
              <Footer.Link href="#">
                <FaGithub className="text-lg hover:text-black" />
              </Footer.Link>
              <Footer.Link href="#">
                <FaDribbble className="text-lg hover:text-black" />
              </Footer.Link>
            </div>
          </Footer.LinkGroup>
        </div>
      </Footer>
      <p className="my-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} HeyDeliver. All rights reserved.
      </p>
    </>
  )
}

export default NavbarSidebarLayout

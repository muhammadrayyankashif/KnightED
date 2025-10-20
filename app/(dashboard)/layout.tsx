import { ConditionalLayout } from './components/conditional-layout'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <ConditionalLayout>{children}</ConditionalLayout>
}

export default DashboardLayout

export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex?: string
  width?: string
  render?: (record: T, index: number) => React.ReactNode
  sortable?: boolean
}

'use client'
import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[]
}
const Select = forwardRef<HTMLSelectElement, SelectProps>(({ options = [], className = '', children, ...props }, ref) => (
  <select ref={ref} className={`w-full px-3 py-2 bg-white border border-[var(--line)] rounded-md text-sm ${className}`} {...props}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    {children}
  </select>
))
Select.displayName = 'Select'
export default Select

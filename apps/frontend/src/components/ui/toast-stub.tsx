export default function useToast() {
  return { toast: (msg: string) => console.log('Toast:', msg) }
}

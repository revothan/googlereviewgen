import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { generateReview } from '@/lib/gemini'
import { BranchInfo } from '@/types'
import { Copy, Star } from 'lucide-react'

interface ReviewGeneratorProps {
  branch: BranchInfo
}

export function ReviewGenerator({ branch }: ReviewGeneratorProps) {
  const [formData, setFormData] = useState({
    experience: '',
    service: ''
  })
  const [generatedReview, setGeneratedReview] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('')

  const simulateProgress = () => {
    const steps = [
      { text: 'Memproses pengalaman Anda...', duration: 1000 },
      { text: 'Menganalisis layanan yang digunakan...', duration: 1200 },
      { text: 'Menyusun kata-kata yang tepat...', duration: 1500 },
      { text: 'Menyelesaikan review Anda...', duration: 800 }
    ]

    let currentProgress = 0
    setProgress(0)
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        setLoadingText(step.text)
        const targetProgress = ((index + 1) / steps.length) * 90 // Stop at 90% until AI finishes
        const progressInterval = setInterval(() => {
          currentProgress += 2
          if (currentProgress >= targetProgress) {
            clearInterval(progressInterval)
          } else {
            setProgress(currentProgress)
          }
        }, 50)
      }, steps.slice(0, index).reduce((sum, s) => sum + s.duration, 0))
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.experience.trim() || !formData.service.trim()) {
      alert('Mohon isi pengalaman dan layanan yang digunakan')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    simulateProgress()
    
    try {
      const review = await generateReview({
        ...formData,
        location: branch.location
      })
      setProgress(100)
      setLoadingText('Review berhasil dibuat!')
      
      setTimeout(() => {
        setGeneratedReview(review)
        setShowReviewDialog(true)
        setIsGenerating(false)
        setProgress(0)
        setLoadingText('')
      }, 500)
    } catch (error) {
      setIsGenerating(false)
      setProgress(0)
      setLoadingText('')
      
      if (error instanceof Error && error.message === "REDIRECT_TO_GOOGLE") {
        // AI service failed, redirect directly to Google Review
        alert('AI sedang bermasalah. Anda akan diarahkan langsung ke halaman Google Review.')
        window.open(branch.reviewLink, '_blank')
      } else {
        alert('Terjadi kesalahan saat menghasilkan review. Silakan coba lagi.')
      }
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedReview)
      setCopySuccess(true)
      
      // Automatically open Google Review page after copying
      setTimeout(() => {
        window.open(branch.reviewLink, '_blank')
        setShowReviewDialog(false)
      }, 1000) // 1 second delay to show "Tersalin!" feedback
      
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      alert('Gagal menyalin review. Silakan copy manual.')
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Generator Review Google
            </h1>
            <p className="text-gray-600">
              {branch.name}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="experience" className="text-base font-medium text-gray-700">
                Ceritakan pengalaman Anda *
              </Label>
              <Textarea
                id="experience"
                placeholder="Contoh: Pelayanan sangat ramah, staf membantu memilih kacamata yang cocok..."
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="mt-1"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="service" className="text-base font-medium text-gray-700">
                Layanan/produk yang digunakan *
              </Label>
              <Input
                id="service"
                placeholder="Contoh: Kacamata minus, lensa progresif, dll"
                value={formData.service}
                onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                className="mt-1"
                required
              />
            </div>

            {isGenerating && (
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-base text-gray-600 text-center">
                  {loadingText}
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isGenerating}
            >
              {isGenerating ? 'Menghasilkan Review...' : 'Buat Review'}
            </Button>
          </form>
        </div>
      </div>

      {/* Review Display Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Anda Siap!</DialogTitle>
            <DialogDescription>
              Klik "Salin & Buka Google Review" untuk menyalin review dan langsung ke halaman Google Review
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-base text-gray-800 leading-relaxed">
              {generatedReview}
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={copyToClipboard}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copySuccess ? 'Tersalin! Membuka Google Review...' : 'Salin & Buka Google Review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
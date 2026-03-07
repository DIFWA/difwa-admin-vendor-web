"use client"

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, Check } from 'lucide-react'

interface Point {
    x: number
    y: number
}

interface Area {
    width: number
    height: number
    x: number
    y: number
}

interface ImageCropperProps {
    image: string
    onCropComplete: (croppedImage: Blob) => void
    onCancel: () => void
}

export default function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const onCropChange = (crop: Point) => {
        setCrop(crop)
    }

    const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<Blob> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            throw new Error('No 2d context')
        }

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob)
            }, 'image/jpeg')
        })
    }

    const handleDone = async () => {
        try {
            if (croppedAreaPixels) {
                const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels)
                onCropComplete(croppedImageBlob)
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-2xl aspect-square bg-black rounded-2xl overflow-hidden shadow-2xl">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteInternal}
                    onZoomChange={onZoomChange}
                />
            </div>

            <div className="mt-8 w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-bold uppercase tracking-widest">Adjust Product Photo</span>
                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Zoom Level</label>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <button
                    onClick={handleDone}
                    className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                >
                    <Check size={20} /> Done Cropping
                </button>
            </div>
        </div>
    )
}

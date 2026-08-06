//client\src\pages\Cases\NewCase\WizardNavButtons.jsx
import React from 'react'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import Button from '../../../components/Button.jsx'

export default function WizardNavButtons({
  isFirstStep, isLastStep, onPrevious, onNext, onSubmit,
  saving = false, submitting = false,
}) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-5 border-t border-border bg-white/95 p-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:p-4">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          icon={ChevronLeft}
          onClick={onPrevious}
          disabled={isFirstStep}
          className="w-full sm:w-auto justify-center"
        >
          Previous
        </Button>

        {isLastStep ? (
          <Button
            variant="primary"
            icon={Send}
            onClick={onSubmit}
            disabled={submitting}
            className="w-full sm:w-auto justify-center"
          >
            {submitting ? 'Submitting...' : 'Submit Case'}
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={ChevronRight}
            onClick={onNext}
            disabled={saving}
            className="w-full sm:w-auto justify-center"
          >
            {saving ? 'Saving...' : 'Next'}
          </Button>
        )}
      </div>
    </div>
  )
}
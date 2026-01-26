import { Notify } from 'quasar'

export function useNotifier() {
  const notifySuccess = (message = 'Opération réussie avec succès.') => {
    Notify.create({
      type: 'positive',
      message,
      position: 'top'
    })
  }

  const notifyError = (message = 'Une erreur est survenue.') => {
    Notify.create({
      type: 'negative',
      message,
      position: 'top'
    })
  }

  const notifyWarning = (message = 'Attention !') => {
    Notify.create({
      type: 'warning',
      message,
      position: 'top'
    })
  }

  const notifyInfo = (message: string) => {
    if(message)
    Notify.create({
      type: 'info',
      message,
      position: 'top'
    })
  }

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  }
}

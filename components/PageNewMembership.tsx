import * as React from 'react'

import { api } from '@/lib/config'
import fetcher from '@/lib/fetcher'
import type { MembershipType } from '@/lib/types'

import { Feedback } from './Feedback'
import { MembershipForm } from './MembershipForm'
import { PageHead } from './PageHead'

export type NewMembershipPageProps = {
  membershipTypes: MembershipType[]
}

export default function NewMembershipPage({
  membershipTypes
}: NewMembershipPageProps) {
  // fetch hooks
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState(false)
  const notAsked = !success && !error

  return (
    <>
      <PageHead title='Modulo Iscrizione Socio' />
      <div className='notion-page'>
        {notAsked && (
          <MembershipForm
            className='notion-page-content'
            membershipTypes={membershipTypes}
            mode='add'
            onConfirm={async (formData) => {
              console.log('New subscription', formData)
              try {
                const result = await fetcher(api.createNewMember, {
                  method: 'POST',
                  body: JSON.stringify(formData.serialize())
                })
                setSuccess(true)
                console.log('Success!', result)
              } catch (error) {
                setError(error)
                console.log('Failed =(', error)
              }
            }}
          />
        )}
        {success && (
          <Feedback
            title='Tutto a posto!'
            description="La tua richiesta è stata inoltrata, presto verrai contattato ai recapiti indicati per completare l'iscrizione"
            size='large'
            status='success'
            className='notion-page-content'
          />
        )}
        {error && (
          <Feedback
            title='Sembra che ci sia un problema...'
            description="Forse il nostro server è sotto scacco. Forse è andato storto qualcos'altro. Riprova più tardi e, se non riuscissi ancora, scrivi una mail a scacchi.cantu@gmail.com."
            size='large'
            status='error'
            className='notion-page-content'
          />
        )}
      </div>
    </>
  )
}

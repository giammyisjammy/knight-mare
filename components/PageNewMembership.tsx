import * as React from 'react'

import { api } from '@/lib/config'
import fetcher from '@/lib/fetcher'
import type { MembershipType } from '@/lib/types'

import MembershipForm from './MembershipForm'
import { PageHead } from './PageHead'

export type NewMembershipPageProps = {
  membershipTypes: MembershipType[]
}

// TODO on success/failure, add result toast and clear form
export default function NewMembershipPage({
  membershipTypes
}: NewMembershipPageProps) {
  return (
    <>
      <PageHead title='Modulo Iscrizione Socio' />
      <div className='notion-page'>
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
              console.log('Success!', result)
            } catch (error) {
              console.log('Failed =(', error)
            }
          }}
        />
      </div>
    </>
  )
}

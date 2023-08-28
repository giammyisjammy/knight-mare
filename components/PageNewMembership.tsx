import * as React from 'react'

import { api } from '@/lib/config'
import fetcher from '@/lib/fetcher'

import MembershipForm from './MembershipForm'
import { PageHead } from './PageHead'

export default function NewMembershipPage() {
  return (
    <>
      <PageHead title='🚧 Modulo Iscrizione Socio (under construction)' />
      <div className='notion-page'>
        {/* <h1 className='notion-title'>Personal information</h1>
        <p className='notion-text-block'>Type your personal information here</p> */}
        <MembershipForm
          className='notion-page-content'
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

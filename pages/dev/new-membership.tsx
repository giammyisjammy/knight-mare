import * as React from 'react'
import { GetStaticProps } from 'next'

import PageNewMembership, {
  NewMembershipPageProps
} from '@/components/PageNewMembership'
import { domain } from '@/lib/config'
import { Params } from '@/lib/types'
import { retrieveMembershipTypes } from '@/lib/notion'

export const getStaticProps: GetStaticProps<
  NewMembershipPageProps,
  Params
> = async () => {
  const rawPageId = 'dev/new-membership'

  try {
    const membershipTypes = await retrieveMembershipTypes()
    return { props: { membershipTypes }, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export default function NewMembershipPage(props) {
  return <PageNewMembership {...props} />
}

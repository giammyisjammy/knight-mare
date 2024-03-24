import * as gmail from '@/lib/google/gmail'
import type { ClubMember } from '@/lib/ClubMember'

export const sendWelcomeMail = (member: ClubMember, pdfBytes: Uint8Array) =>
  gmail.send({
    from: '"Circolo Scacchi Cantù" <scacchi.cantu@gmail.com>',
    to: member.email,
    subject: `Modulo di iscrizione ${member.firstName}`,
    message: `Buonasera ${member.firstName} 👋<br/>
  <br/>
  Ti alleghiamo il modulo di iscrizione da firmare e:
  <ul>
  <li>allegarlo in risposta a questa mail; oppure</li>
  <li>consegnarlo a mano in sede</li>
  </ul>
  Ricordati che l’iscrizione diventerà effettiva solo in a seguito al pagamento della quota associativa da effettuare di persona in sede.<br/>
  <br/>
  Ti aspettiamo tutti i mercoledì sera dalle 21:00 alle 23:00
  <br/>
  <br/>
  <i><h4>Trattamento dei dati e delle immagini</h4><br/>
  Ai sensi del D. Lgs. n. 163/2003 i dati riportati nel modulo sono prescritti dalle disposizioni vigenti ai fini del procedimento per il quale sono richiesti e verranno utilizzati unicamente a tale scopo.<br/>
  Saranno conservati dalla ns. Associazione e pubblicati sul sito www.circoloscacchicantu.com.<br/>
  La sottoscrizione del presente modulo vale anche come <b>consenso ad utilizzare fotografie ed immagini</b> che mi ritraggano solo ed esclusivamente ai fini promozionali e di comunicazione, in contesti collegati alle attività e agli eventi scacchistici della nostra Associazione (canali Facebook, Instagram e Whatsapp).</i><br/>
  -- <br/>
  <i>Email auto-generata al momento dell'iscrizione</i> <br/>
  `,
    attachments: [
      {
        type: 'application/pdf',
        filename: `Domanda di iscrizione ${member.fullName}.pdf`,
        content: pdfBytes
      }
    ]
  })

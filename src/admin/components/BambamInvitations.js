import React from 'react';
import moment from 'moment';
import has from 'lodash/has';

const BambamRow = ({inviter, invitee}, inviteeReg, event) => {
  let status;
  if (has(inviteeReg, 'registration.order.roomChoice')) {
    status = "registered";
  } else if (has(inviteeReg, 'registration.scholarship')) {
    status = inviteeReg.registration.scholarship.type === 'yml' ? 'yml' : 'scholarship';
  } else if (moment().isSameOrBefore(moment(invitee.invited_at)
        .add(event.bambamDiscount.registerByAmount, event.bambamDiscount.registerByUnit)
        .endOf('day'))) {
    status = "eligible";
  } else {
    status = "expired";
  }

  return (
    <tr key={invitee.email}>
      <th scope="row">
        {invitee.email}
      </th>
      <td>{inviteeReg && inviteeReg.user.profile &&
        `${inviteeReg.user.profile.first_name} ${inviteeReg.user.profile.last_name}`}</td>
      <td>{inviter.profile && `${inviter.profile.first_name} ${inviter.profile.last_name}`}</td>
      <td>{status}</td>
      <td>{moment(invitee.invited_at).format("MMMM D")}</td>
    </tr>
  );
};

const BambamInvitations = ({registrations, event}) => {
  let registrationsByEmail = registrations.reduce((acc, reg) => {
    acc[reg.user.email] = reg;
    return acc;
  }, {});
  let invitations = registrations
    .reduce((acc, reg) => {
      if (!reg.registration.bambam_invites) {
        return acc;
      }
      return acc.concat(Object.keys(reg.registration.bambam_invites)
      .map(k => reg.registration.bambam_invites[k])
      .map(invite => ({
        inviter: reg.user,
        invitee: invite
      })));
    }, []);

  return (
    <div className="mt-3">
      <h3 className="text-center">
        Bambam Invitations
      </h3>
      <div className="table-responsive-md">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Name</th>
              <th scope="col">Invited by</th>
              <th scope="col">Status</th>
              <th scope="col">Invited Date</th>
            </tr>
          </thead>
          <tbody>
          { invitations.map(r => BambamRow(r, registrationsByEmail[r.invitee.email], event)) }
          </tbody>
        </table>
      </div>
      <span className="font-italic">Total invitations: {invitations.length}</span>
    </div>
  );
}

export default BambamInvitations;

// 연차 관련 함수들

const handleLeaveSubmit = () => {
  if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason || !leaveForm.contact) {
    setLeaveFormError('모든 필드를 입력해주세요.');
    return;
  }

  if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
    setLeaveFormError('시작일이 종료일보다 늦을 수 없습니다.');
    return;
  }

  const newLeaveRequest = {
    id: leaveRequests.length + 1,
    employeeId: currentUser.id,
    startDate: leaveForm.startDate,
    endDate: leaveForm.endDate,
    type: leaveForm.type,
    reason: leaveForm.reason,
    contact: leaveForm.contact,
    status: '대기중',
    requestDate: new Date().toISOString().split('T')[0]
  };

  setLeaveRequests([...leaveRequests, newLeaveRequest]);
  setLeaveForm({
    startDate: '',
    endDate: '',
    type: '연차',
    reason: '',
    contact: ''
  });
  setLeaveFormError('');
  alert('연차 신청이 완료되었습니다.');
};

const handleLeaveCancel = (leaveId) => {
  const leaveRequest = leaveRequests.find(lr => lr.id === leaveId);
  if (leaveRequest?.status === '승인') {
    alert('이미 승인된 연차는 취소할 수 없습니다.');
    return;
  }
  
  if (confirm('연차 신청을 취소하시겠습니까?')) {
    setLeaveRequests(leaveRequests.filter(lr => lr.id !== leaveId));
    alert('연차 신청이 취소되었습니다.');
  }
};

const handleLeaveEdit = (leaveId) => {
  const leaveRequest = leaveRequests.find(lr => lr.id === leaveId);
  if (leaveRequest?.status === '승인') {
    alert('이미 승인된 연차는 수정할 수 없습니다.');
    return;
  }

  setEditingLeaveId(leaveId);
  setLeaveForm({
    startDate: leaveRequest.startDate,
    endDate: leaveRequest.endDate,
    type: leaveRequest.type,
    reason: leaveRequest.reason,
    contact: leaveRequest.contact
  });
  setShowLeaveEditModal(true);
};

const handleLeaveUpdate = () => {
  if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason || !leaveForm.contact) {
    setLeaveFormError('모든 필드를 입력해주세요.');
    return;
  }

  if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
    setLeaveFormError('시작일이 종료일보다 늦을 수 없습니다.');
    return;
  }

  const updatedRequests = leaveRequests.map(lr => 
    lr.id === editingLeaveId 
      ? {
          ...lr,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          type: leaveForm.type,
          reason: leaveForm.reason,
          contact: leaveForm.contact
        }
      : lr
  );

  setLeaveRequests(updatedRequests);
  setShowLeaveEditModal(false);
  setEditingLeaveId(null);
  setLeaveForm({
    startDate: '',
    endDate: '',
    type: '연차',
    reason: '',
    contact: ''
  });
  setLeaveFormError('');
  alert('연차 신청이 수정되었습니다.');
};
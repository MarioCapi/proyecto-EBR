SELECT
    at.transaction_id,
    at.name AS transaction_name,
    at.transaction_begin_time,
    at.transaction_state,
    at.transaction_type,
    at.transaction_uow,
    st.session_id,
    st.is_user_transaction,
    st.transaction_status,
    er.blocking_session_id,
    er.wait_type,
    er.wait_time,
    er.wait_resource,
    er.command,
    er.cpu_time,
    er.total_elapsed_time,
    er.sql_handle,
    er.statement_start_offset,
    er.statement_end_offset
FROM
    sys.dm_tran_active_transactions AS at
LEFT JOIN
    sys.dm_tran_session_transactions AS st ON at.transaction_id = st.transaction_id
LEFT JOIN
    sys.dm_exec_requests AS er ON st.session_id = er.session_id;

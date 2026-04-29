-- Trigger for application ID generation
CREATE OR REPLACE TRIGGER trigger_generate_application_id
    BEFORE INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION generate_application_id();

-- Trigger for transaction ID generation
CREATE OR REPLACE TRIGGER trigger_generate_transaction_id
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_transaction_id();

-- Trigger for updated_at timestamp on users
CREATE OR REPLACE TRIGGER trigger_update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at timestamp on universities
CREATE OR REPLACE TRIGGER trigger_update_universities_timestamp
    BEFORE UPDATE ON universities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at timestamp on applications
CREATE OR REPLACE TRIGGER trigger_update_applications_timestamp
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at timestamp on payments
CREATE OR REPLACE TRIGGER trigger_update_payments_timestamp
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification on new application
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (type, title, message, metadata)
    VALUES (
        'info',
        'New Application',
        'New application received from ' || NEW.student_name || ' for ' || NEW.course,
        jsonb_build_object('application_id', NEW.id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new application notification
DROP TRIGGER IF EXISTS trigger_new_application_notification ON applications;
CREATE TRIGGER trigger_new_application_notification
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_application();

-- Function to create notification on status change
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO notifications (type, title, message, metadata)
        VALUES (
            CASE 
                WHEN NEW.status = 'approved' THEN 'success'
                WHEN NEW.status = 'rejected' THEN 'error'
                ELSE 'info'
            END,
            'Application Status Updated',
            'Application ' || NEW.application_id || ' status changed to ' || NEW.status,
            jsonb_build_object('application_id', NEW.id, 'status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for application status change
DROP TRIGGER IF EXISTS trigger_application_status_change ON applications;
CREATE TRIGGER trigger_application_status_change
    AFTER UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION notify_status_change();
<?php

require_once 'oracle/config.php';

//PMM
class DB{
	
	private static $instance;

	public static function getInstance()
	{
		if(!isset(self::$instance)){
			try {
				self::$instance = new OCI('GABRIEL_VIEIRA','36384969','172.17.131.45:1521/pmmdev');
			} catch (PDOException $e) {
				echo $e->getMessage();
			}
		}
		return self::$instance;
	}
}
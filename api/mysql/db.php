<?php

//PMM
class DB{
	
	private static $instance;

	public static function getInstance()
	{
		if(!isset(self::$instance)){
			try {
				self::$instance = new PDO('mysql:host=localhost;dbname=pmm, root, ');
			} catch(PDOException $e) {
				echo $e->getMessage();
			}				
		}
		return self::$instance;
	}
}